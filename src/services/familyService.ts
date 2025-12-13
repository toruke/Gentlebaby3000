
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

// Définition des types pour la clarté
export type FamilyMemberRole = 'tuteur' | 'tuteur secondaire' | 'membre' | 'enfant';
export type FamilyMember = {
    userId: string;
    role: FamilyMemberRole;
    joinedAt: Timestamp | FieldValue; // ou Timestamp
    displayName?: string;
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
    console.error('❌ Erreur de suppression de la photo :', error);
    // On ne throw pas forcément ici pour ne pas bloquer une suppression de doc si l'image n'existe plus
  }
}