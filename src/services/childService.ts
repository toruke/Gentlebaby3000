import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebaseConfig';

// Interface pour la création (sans ID)
interface NewChildData {
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'male' | 'female';
  photoUri?: string;
  device?: string | null;
}

export async function addChildProfile(familyId: string, childData: NewChildData) {
  try {
    let photoUrl = '';

    // 1. Upload de la photo si présente
    if (childData.photoUri) {
      const response = await fetch(childData.photoUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `children/${familyId}/${Date.now()}_${childData.firstName}.jpg`);
      await uploadBytes(storageRef, blob);
      photoUrl = await getDownloadURL(storageRef);
    }

    // 2. Préparation des données pour la SOUS-COLLECTION
    // Note: On utilise 'birthDate' (compatible Date/Timestamp) et 'device' (singulier)
    const newChild = {
      firstName: childData.firstName,
      lastName: childData.lastName,
      birthDate: childData.birthDate, // Firestore convertira auto en Timestamp
      gender: childData.gender,
      photoUrl: photoUrl,
      createdAt: serverTimestamp(),
      device: null, // Initialisé à null
      // Plus besoin de champs legacy 'birthday' ou 'devices' ici
    };

    // 3. Ajout dans la sous-collection 'children' UNIQUEMENT
    const childrenRef = collection(db, 'family', familyId, 'children');
    const docRef = await addDoc(childrenRef, newChild);

    console.log('✅ Enfant ajouté dans la sous-collection avec ID:', docRef.id);
    
    // 🚫 SUPPRESSION DE L'ÉTAPE : updateDoc(familyRef, { babies: arrayUnion(...) })
    // On ne touche plus au document parent.

    return docRef.id;

  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'enfant:', error);
    throw error;
  }
}