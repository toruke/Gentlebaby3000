import {
  collection,
  doc,
  serverTimestamp,
  writeBatch, // 🔹 On utilise writeBatch pour la sécurité des données
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { auth, db, storage } from '../../config/firebaseConfig';

// Import du modèle Device (créé précédemment dans src/models/Device.ts)
import { Device } from '../models/device';

// Définition des types pour la clarté
export type FamilyMemberRole = 'tuteur' | 'tuteur secondaire' | 'membre' | 'enfant';
export type FamilyMember = {
  userId: string;
  role: FamilyMemberRole;
  joinedAt: Timestamp | FieldValue; // ou Timestamp
  displayName?: string;
  // Ajout du champ optionnel pour TypeScript, car il est ajouté dynamiquement plus tard
  devices?: string | null; 
};

/**
 * Crée une nouvelle famille avec une sous-collection 'members'
 */
export async function createFamily(familyName: string, imageUri?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Utilisateur non connecté');

  let imageUrl = '';

  // 📸 1. Upload de la photo (si présente)
  if (imageUri) {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    // Bonne pratique : dossier "families" dans le storage
    const imageRef = ref(storage, `families/${user.uid}_${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    imageUrl = await getDownloadURL(imageRef);
  }

  // 🛠 2. Préparation des références (sans écrire tout de suite)
  const batch = writeBatch(db); // On initialise un "batch"

  // Réf du document Famille
  const familyRef = doc(collection(db, 'family'));

  // Réf du document Membre (dans la sous-collection)
  // Chemin: family/{familyId}/members/{userId}
  const memberRef = doc(db, 'family', familyRef.id, 'members', user.uid);

  // 📝 3. Données de la Famille (Parent)
  const familyData = {
    familyId: familyRef.id,
    name: familyName,
    createdBy: user.uid,
    createdByName: user.displayName || 'Tuteur inconnu',
    createdAt: serverTimestamp(),
    photoUrl: imageUrl,
    // ⚠️ CRUCIAL : On garde un tableau simple des IDs pour les requêtes "array-contains"
    memberIds: [user.uid],
    babies: [],
  };

  // 👨‍👩‍👧 4. Données du Membre (Sous-collection)
  const memberData: FamilyMember = {
    userId: user.uid,
    role: 'tuteur', // Le créateur est admin/tuteur par défaut
    joinedAt: serverTimestamp(),
    displayName: user.displayName || 'Utilisateur',
  };

  // 🚀 5. Ajout des opérations au batch
  batch.set(familyRef, familyData);
  batch.set(memberRef, memberData);

  // 6. Exécution atomique (tout réussit ou tout échoue)
  await batch.commit();

  return familyRef.id;
}

export async function deleteFamilyPhoto(photoUrl: string) {
  if (!photoUrl) return;
  try {
    const photoRef = ref(storage, photoUrl);
    await deleteObject(photoRef);
    console.log('✅ Photo supprimée avec succès');
  } catch (error) {
    // CORRECTION : On loggue l'erreur pour le debug, mais on ne la "throw" pas
    console.warn('⚠️ Erreur suppression photo (non bloquant) :', error);
  }
}

/**
 * 🆕 Associe un appareil découvert (via UDP) à un membre de la famille.
 * Crée le document dans la sous-collection 'devices' et met à jour le membre.
 */
export async function linkDeviceToMember(
  familyId: string, 
  userId: string, 
  device: { serialNumber: string, type: string },
) {
  // Sécurités basiques
  if (!familyId || !userId || !device.serialNumber) {
    throw new Error('Informations manquantes pour l\'association de l\'appareil.');
  }

  const batch = writeBatch(db);

  // 1. Référence au document Device
  // Chemin : family/{familyId}/devices/{serialNumber}
  const deviceRef = doc(db, 'family', familyId, 'devices', device.serialNumber);

  // Préparation des données du device selon le modèle Device
  const newDeviceData: Device = {
    serialNumber: device.serialNumber,
    type: device.type as 'EMITTER' | 'RECEIVER',
    status: 'online',
    pairedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  };

  // 2. Référence au Membre existant
  // Chemin : family/{familyId}/members/{userId}
  const memberRef = doc(db, 'family', familyId, 'members', userId);

  // 3. Ajout des opérations au batch
  batch.set(deviceRef, newDeviceData); // Crée ou écrase le device
  
  // Met à jour le champ 'devices' du membre avec le numéro de série
  batch.update(memberRef, {
    devices: device.serialNumber, 
  });

  // 4. Exécution atomique
  await batch.commit();
  console.log(`✅ Device ${device.serialNumber} associé à ${userId}`);
}