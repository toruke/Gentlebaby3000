import { useState } from 'react';
import { User } from '../models/user';
import { verificationEmail, verificationPassword } from '../utils/Verificaion';


export const useEditProfile = (user: User, onClose: () => void) => {

  const [editFirstname, setEditFirstname] = useState<string>(user.firstname);
  const [editLastname, setEditLastname] = useState<string>(user.lastname);
  const [editMailAddress, setEditMailAddress] = useState<string>(user.mail_address);
  const [step, setStep] = useState<'verify' | 'ready' | 'change'>('verify');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');

  const onSubmit = () => {
    if (editFirstname.trim().length === 0 || editLastname.trim().length === 0) {
      setError('Vous devez remplir tous les champs');
      return;
    }
    if (!verificationEmail(editMailAddress)) {
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
    const updateUser: User = {
      id: user.id,
      firstname: editFirstname,
      lastname: editLastname,
      mail_address: editMailAddress,
      password: step === 'change' ? newPassword : user.password,
    };
    // eslint-disable-next-line no-console
    console.log(updateUser);
    onClose();

  };

  const onSubmitPassword = () => {
    if (currentPassword === user.password) {
      setStep('ready');
      setError('');
    }
    else {
      setError('Le mot de passe est invalide');
    }
  };

  return { onSubmit, onSubmitPassword, editFirstname, editLastname, editMailAddress, step, currentPassword, newPassword, confirmPassword, setEditFirstname, setEditLastname, setEditMailAddress, setStep, setCurrentPassword, setNewPassword, setConfirmPassword, error, setError };
};