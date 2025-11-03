import { db } from '@/config/firebaseConfig';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getCurrentAuthUser } from './auth';

const MEMBERBERSHIP_COLLECTION = 'userFamily';


export async function verificationTutor(familyId: string) {
  try {

    const user = getCurrentAuthUser();

    const tutorQuery = query(
      collection(db, MEMBERBERSHIP_COLLECTION),
      where('userId', '==', user.uid),
      where('familyId', '==', familyId),
    );
    const snapTutor = await getDocs(tutorQuery);
    
    if (snapTutor.empty){
      return 'Une erreur est survenue lors de la récupération des données utilisateurs';
    }

    const memberDoc = snapTutor.docs[0];
    const data = memberDoc.data();
    if (data.role === 'tuteur'){
      return true;
    }
    else{
      return false;
    }
  }
  catch (error){
    console.log(error);
    return 'Erreur lors de la vérification si l\'utilisateur connecté est tuteur';
  }
}
export async function updateRoleUser (userId: string, familyId: string, role: string) {

  try {
    const user = getCurrentAuthUser();

    const tutor = await verificationTutor(familyId);

    if (!tutor) {
      return 'Accès refusé: seuls les tuteurs peuvent modifier les rôles';
    }

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

    if (userId === user.uid){
      return '"Vous ne pouvez pas modifier votre propre rôle.';
    }

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