// services/familyService.ts
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebaseConfig';

/**
 * Crée une nouvelle famille
 */
export async function createFamily(familyName: string, imageUri?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Utilisateur non connecté');

  let imageUrl = '';

  // 📸 Upload de la photo (si présente)
  if (imageUri) {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const imageRef = ref(storage, `families/${user.uid}_${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    imageUrl = await getDownloadURL(imageRef);
  }

  // 🧩 Création du document famille
  const familyRef = doc(collection(db, 'families'));
  const familyData = {
    familyId: familyRef.id,
    name: familyName,
    createdBy: user.uid,
    createdByName: user.displayName || 'Tuteur inconnu', // 🔹 nom visible du tuteur
    createdAt: serverTimestamp(),
    photoUrl: imageUrl,
    members: [user.uid],
    babies: [],
  };

  await setDoc(familyRef, familyData);

  // 👨‍👩‍👧 Création du document Membership
  await addDoc(collection(db, 'memberships'), {
    userId: user.uid,
    familyId: familyRef.id,
    role: 'Tuteur principal',
    status: 'active',
    createdAt: serverTimestamp(),
  });

  return familyRef.id;
}

/**
 * Supprime une photo de famille du Storage Firebase
 */
export async function deleteFamilyPhoto(photoUrl: string) {
  try {
    const photoRef = ref(storage, photoUrl);
    await deleteObject(photoRef);
    console.log('✅ Photo supprimée avec succès');
  } catch (error) {
    console.error('❌ Erreur de suppression de la photo :', error);
    throw error;
  }
}