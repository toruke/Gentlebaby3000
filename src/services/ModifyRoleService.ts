import { db } from '@/config/firebaseConfig';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

const MEMBERBERSHIP_COLLECTION = 'userFamily';

export async function updateRoleUser (userId: string, familyId: string, role: string) {

  try {

    if (!userId || !familyId || !role) {
      throw new Error('Paramètres invalides pour la mise à jour du rôle.');
    }

    const memberQuery = query(
      collection(db, MEMBERBERSHIP_COLLECTION),
      where('userId', '==', userId),
      where('familyId', '==', familyId),
    );
    const snapMember = await getDocs(memberQuery);
    
    if (snapMember.empty){
      return 'Une erreur est survenue lors de la récupération des données utilisateurs';
    }

    const memberDoc = snapMember.docs[0];
    const data = memberDoc.data();

    if (data.role === role){
      return 'Le rôle est déjà celui sélectionné';

    }
    await updateDoc(doc(db, MEMBERBERSHIP_COLLECTION, memberDoc.id), {role});

    return 'Rôle mis à jour avec succès';
  }
  catch (error){
    console.log(error);
    return 'Erreur lors de la mise à jour du rôle';
  }


}