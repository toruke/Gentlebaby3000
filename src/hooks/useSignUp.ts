import { router } from 'expo-router';
import { fetchSignInMethodsForEmail, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

import { auth } from '../../config/firebaseConfig';
import { signUp } from '../services/auth';
import { upsertUser } from '../services/user';

import { notify } from '../utils/notify';
import { isValidEmail, verificationPassword } from '../utils/validation';

export function useSignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const e = email.trim();

    if (!firstName.trim()) return notify('Erreur', 'Prénom requis.');
    if (!lastName.trim()) return notify('Erreur', 'Nom requis.');
    if (!isValidEmail(e)) return notify('Erreur', 'Email invalide.');
    if (!verificationPassword(password)) {
      return notify(
        'Erreur',
        'Mot de passe trop faible : minimum 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
      );
    }
    if (password !== confirm) return notify('Erreur', 'Les mots de passe ne correspondent pas.');

    try {
      setLoading(true);
      console.log('[signup] start');

      try {
        const methods = await fetchSignInMethodsForEmail(auth, e);
        console.log('[signup] precheck methods:', methods);
        if (methods.length > 0) {
          notify('Email déjà utilisé', 'Un compte existe déjà avec cet email. Essayez de vous connecter.');
          console.log('[signup] blocked: email taken');
          return;
        }
      } catch (preErr) {
        console.log('[signup] precheck error (ignored, continue with signUp):', preErr);
      }

      const user = await signUp(e, password);
      console.log('[signup] auth ok:', user.uid);

      try {
        await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
        console.log('[signup] updateProfile ok');
      } catch (upErr) {
        console.log('[signup] updateProfile error:', upErr);
      }

      try {
        await upsertUser({
          userId: user.uid,
          email: user.email ?? e,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        console.log('[signup] upsertUser ok');
      } catch (writeErr) {
        console.log('[signup] upsertUser error (non bloquant):', writeErr);
      }

      const fullName =
        `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ').trim() ||
        user.displayName ||
        user.email ||
        e;

      if (Platform.OS === 'web') {
        notify('Compte créé avec succès', `Bienvenue, ${fullName} !`);
        router.replace('/profils');
      } else {
        Alert.alert(
          'Succès',
          `Compte créé pour ${user.email ?? e}`,
          [{ text: 'OK', onPress: () => router.replace('/profils') }],
        );
      }
    } catch (err: unknown) {
      console.log('[signup] catch:', err);
      let code: string | undefined;
      let message: string | undefined;
      if (typeof err === 'object' && err !== null) {
        code = (err as { code?: string }).code;
        message = (err as { message?: string }).message;
      }
      if (code === 'auth/email-already-in-use') {
        notify('Erreur', 'Cet email est déjà utilisé. Essayez de vous connecter.');
      } else if (code === 'auth/invalid-email') {
        notify('Erreur', 'Email invalide.');
      } else if (code === 'auth/weak-password') {
        notify('Erreur', 'Mot de passe trop faible (6+).');
      } else {
        notify('Erreur', message ?? 'Échec de l\'inscription');
      }
    } finally {
      setLoading(false);
      console.log('[signup] end');
    }
  }

  return {
    firstName, lastName, email, password, confirm, loading,

    setFirstName, setLastName, setEmail, setPassword, setConfirm,

    onSubmit,
  };
}
