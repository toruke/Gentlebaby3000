import {
  collection,
  getDoc,
  doc,
  serverTimestamp,
  writeBatch,
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
import { Device } from '../models/device';

export type FamilyMemberRole = 'tuteur' | 'tuteur secondaire' | 'membre' | 'enfant';

export type FamilyMember = {
  userId: string;
  role: FamilyMemberRole;
  joinedAt: Timestamp | FieldValue;
  displayName?: string;
  device?: string | null; // 🟢 Champ unique 'device'
};

// ... (Gardez createFamily et deleteFamilyPhoto inchangés) ...
export async function createFamily(familyName: string, imageUri?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Utilisateur non connecté');

  let imageUrl = '';
  if (imageUri) {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const imageRef = ref(storage, `families/${user.uid}_${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    imageUrl = await getDownloadURL(imageRef);
  }

  const batch = writeBatch(db);
  const familyRef = doc(collection(db, 'family'));
  const memberRef = doc(db, 'family', familyRef.id, 'members', user.uid);

  const familyData = {
    familyId: familyRef.id,
    name: familyName,
    createdBy: user.uid,
    createdByName: user.displayName || 'Tuteur inconnu',
    createdAt: serverTimestamp(),
    photoUrl: imageUrl,
    memberIds: [user.uid],
  };

  const memberData: FamilyMember = {
    userId: user.uid,
    role: 'tuteur',
    joinedAt: serverTimestamp(),
    displayName: user.displayName || 'Utilisateur',
    device: null,
  };

  batch.set(familyRef, familyData);
  batch.set(memberRef, memberData);
  await batch.commit();

  return familyRef.id;
}

export async function deleteFamilyPhoto(photoUrl: string) {
  if (!photoUrl) return;
  try {
    const photoRef = ref(storage, photoUrl);
    await deleteObject(photoRef);
  } catch (error) {
    console.warn('⚠️ Erreur suppression photo (non bloquant) :', error);
  }
}

/**
 * 🆕 Associe un appareil à un Membre OU un Enfant
 */
export async function linkDeviceToMember(
  familyId: string, 
  targetId: string, 
  device: { serialNumber: string, type: string },
) {
  if (!familyId || !targetId || !device.serialNumber) {
    throw new Error('Informations manquantes pour l\'association.');
  }

  const batch = writeBatch(db);

  // 1. Chercher la cible (Membre ou Enfant)
  let targetRef = doc(db, 'family', familyId, 'members', targetId);
  let docSnap = await getDoc(targetRef);

  // Si pas trouvé dans Members, chercher dans Children
  if (!docSnap.exists()) {
    const childRef = doc(db, 'family', familyId, 'children', targetId);
    docSnap = await getDoc(childRef);
    if (docSnap.exists()) {
      targetRef = childRef;
    } else {
      throw new Error(`Utilisateur introuvable (ID: ${targetId})`);
    }
  }

  // 2. Créer le document Device
  const deviceRef = doc(db, 'family', familyId, 'devices', device.serialNumber);
  const newDeviceData: Device = {
    serialNumber: device.serialNumber,
    type: device.type as 'EMITTER' | 'RECEIVER',
    status: 'online',
    pairedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  };
  batch.set(deviceRef, newDeviceData);

  // 3. Mettre à jour la cible avec le champ 'device'
  batch.update(targetRef, {
    device: device.serialNumber, // 🟢 On écrit dans 'device'
  });

  await batch.commit();
  console.log(`✅ Device ${device.serialNumber} associé à ${targetId}`);
}

/**
 * 🗑️ Dissocie un appareil
 */
export async function unlinkDeviceFromMember(familyId: string, targetId: string) {
  if (!familyId || !targetId) throw new Error('ID manquants');

  const batch = writeBatch(db);

  // 1. Trouver la cible
  let targetRef = doc(db, 'family', familyId, 'members', targetId);
  let docSnap = await getDoc(targetRef);
  
  if (!docSnap.exists()) {
    const childRef = doc(db, 'family', familyId, 'children', targetId);
    docSnap = await getDoc(childRef);
    targetRef = childRef;
  }

  if (!docSnap.exists()) throw new Error('Utilisateur introuvable');

  const data = docSnap.data();
  // 🟢 On lit 'device' (ou 'device' pour compatibilité temporaire)
  const deviceSerial = data?.device; 

  if (!deviceSerial) return; 

  // 2. Supprimer le device
  const deviceRef = doc(db, 'family', familyId, 'device', deviceSerial);
  batch.delete(deviceRef);

  // 3. Nettoyer le profil
  batch.update(targetRef, { 
    device: null,
  });

  await batch.commit();
  console.log(`✅ Appareil ${deviceSerial} dissocié.`);
}