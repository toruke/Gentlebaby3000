import { useEffect, useState } from 'react';
import { isValidEmail, verificationPassword } from '../utils/validation';
import { User } from '../components/EditProfileForm';
import { getProfileUser, getVerificationPassword, updateProfileUser } from '../services/EditProfileService';


export const useEditProfile =  (onClose: () => void) => {
  
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User>();
  const [editFirstname, setEditFirstname] = useState<string>('');
  const [editLastname, setEditLastname] = useState<string>('');
  const [editMailAddress, setEditMailAddress] = useState<string>('');
  const [step, setStep] = useState<'verify' | 'ready' | 'change'>('verify');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const snapUser = await getProfileUser();
        if (snapUser.empty) {
          setError('Une erreur est survenue lors de la récupération des données utilisateurs');
          return ;
        }
        const userDoc = snapUser.docs[0];
        const userData = userDoc.data();
        console.log(userData);

        const fetchedUser: User = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        };
        setEditFirstname(fetchedUser.firstName);
        setEditLastname(fetchedUser.lastName);
        setEditMailAddress(fetchedUser.email);
        setUser(fetchedUser);
        console.log(fetchedUser);

      }
      catch(error){
        console.error('Erreur Firebase: ' , error);
        setError('Erreur lors de la récupération des données utilisateurs');
      }
    };
    fetchUser();
  },[]);


  const onSubmit = async () => {
    if (!user){
      setError('Utilisateur non chargé');
      return;
    }
    if (!editFirstname.trim()|| !editLastname.trim()) {
      setError('Vous devez remplir tous les champs');
      return;
    }
    if (!isValidEmail(editMailAddress)) {
      setError('Votre adresse mail n\'est pas valide');
      return;

    }

    if (step === 'change') {
      if (!verificationPassword(newPassword)) {
        setError('Votre mot de passe n\'est pas valide');
        return;

      }
      if (newPassword !== confirmPassword) {
        setError('Vos mots de passe ne sont pas identiques');
        return;
      }
    }
    const result = await updateProfileUser(editFirstname,editLastname,editMailAddress, step === 'change' ? newPassword : undefined);
    if (result.includes('réussie')) {
      setError('');

      const updatedUser: User = {
        firstName: editFirstname,
        lastName: editLastname,
        email: editMailAddress,
      };
      setUser(updatedUser);
      onClose();
    }
    else {
      setError(result);
    }
    
  };

  const onSubmitPassword = async () => {
    const passwordVerif = await getVerificationPassword(currentPassword);
    if (passwordVerif) {
      setStep('ready');
      setError('');
    }
    else {
      setError('Le mot de passe est invalide');
    }
  };

  return { user, onSubmit, onSubmitPassword, editFirstname, editLastname, editMailAddress, step, currentPassword, newPassword, confirmPassword, setEditFirstname, setEditLastname, setEditMailAddress, setStep, setCurrentPassword, setNewPassword, setConfirmPassword, error, setError };
};