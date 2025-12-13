import { collection, where, getDocs, doc, query, updateDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
//import { db } from '@/config/firebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';

const USERS_COLLECTION = 'user';
type UserUpdate = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export async function getVerificationPassword(password : string) {
  //connected user verification 
  const user = auth.currentUser;

  if (!user) throw new Error('Utilisateur non connecté');

  try{
    if (!user.email) throw new Error('Utilisateur sans e-mail');

    const credential = EmailAuthProvider.credential(
      user.email,
      password.trim(),
    );
    
    await reauthenticateWithCredential(user, credential);

    return true;
  }
  catch (error) {
    console.log(error);
    return false;
  }

};

export async function updateThePassword(password? : string) {
  const user = auth.currentUser;
  

  if (!user) throw new Error('Utilisateur non connecté');
  if (!password) return 'Aucun mot de passe fourni.';

  try{
    
    await updatePassword(user,password);
    console.log('Mot de passe Firebase Auth mis à jour avec succès');


    await user.reload();
    return 'La modification est réussie';
  }
  catch (error) {
    console.log(error);
    return 'La modification a échoué';
  }

};
export async function updateTheEmail(userId: string, email : string) {  

  if (!email) return 'Aucun email fourni.';

  try{
    await updateDoc(doc(db, USERS_COLLECTION, userId), {email});

    return 'La modification est réussie';
  }
  catch (error) {
    console.log(error);
    return 'La modification a échoué';
  }

};

export async function getProfileUser(): Promise<QuerySnapshot<DocumentData>> {
  //connected user verification 
  const user = auth.currentUser;
  console.log(user);

  if (!user) throw new Error('Utilisateur non connecté');

  const userQuery = query(
    collection(db, USERS_COLLECTION),
    where('__name__', '==', user.uid));
  console.log(userQuery);
  const snapUser = await getDocs(userQuery);
  console.log(snapUser.docs[0]);

  return snapUser;

}



export async function updateProfileUser(firstname: string, lastname: string, email: string, newPassword?: string ) {
  //connected user verification 
  const user = auth.currentUser;
  

  if (!user) throw new Error('Utilisateur non connecté');
  console.log('------------------');
  console.log(user.providerData);

  try{
    const snap = await getProfileUser();
    if (snap.empty) {
      return 'Une erreur est survenue lors de la récupération des données utilisateurs';
    }

    const userDoc = snap.docs[0];
    const data = userDoc.data();
  
    const update : UserUpdate = {};
    let emailUpdatePending = false;

    if (data.firstName !== firstname){
      update.firstName = firstname;
    }
    if (data.lastName !== lastname){
      update.lastName = lastname;
    }
    if (data.email !== email){
      try {
        const isEmailPasswordProvider = user.providerData.some(
          (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID);
        if (!isEmailPasswordProvider) {
          return 'Changement d’email impossible : votre compte n’utilise pas le provider Email/Password.';
        }

        if (!user.emailVerified) {
          return 'Veuillez vérifier votre email avant de le modifier.';
        }

        await verifyBeforeUpdateEmail(user, email);
        emailUpdatePending = true;
        //return 'Un email de vérification a été envoyé à votre nouvelle adresse. Veuillez la confirmer pour finaliser le changement.';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Erreur complète:', JSON.stringify(error, null, 2));
        console.log(error);
        if (error.code === 'auth/operation-not-allowed') {
          return 'Changement d’email impossible : activation du provider Email/Password requise.';
        }
        return 'Erreur lors de la mise à jour de l’email dans Auth';
      }
    }

    if (newPassword) {
      const success = await updateThePassword(newPassword);
      if (!success) return 'Erreur lors de la mise à jour du mot de passe';
    }

    if (Object.keys(update).length > 0){
      await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), update);
      console.log('La modification est réussie');
    }
    if (emailUpdatePending) {
      return 'Un email de vérification a été envoyé à votre nouvelle adresse. Veuillez la confirmer pour finaliser le changement.';
    }
    
    return 'La modification est réussie';
  }
  catch (error) {
    console.log(error);
    return 'La modification a échoué';
  }
};
