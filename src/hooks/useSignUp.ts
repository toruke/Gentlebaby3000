import { router } from 'expo-router';
import { fetchSignInMethodsForEmail, sendEmailVerification, updateProfile } from 'firebase/auth';
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

      // --- 1. Vérification de l'email ---
      try {
        const methods = await fetchSignInMethodsForEmail(auth, e);
        if (methods.length > 0) {
          notify('Email déjà utilisé', 'Un compte existe déjà avec cet email. Essayez de vous connecter.');
          return;
        }
      } catch (_preErr) {
        // On loggue l'erreur pour savoir s'il y a un souci réseau, mais on ne bloque pas
        console.warn('Erreur pré-vérification email (non bloquant) :', _preErr);
      }

      // --- 2. Création du compte (Auth) ---
      const user = await signUp(e, password);

      // --- 3. Envoi email vérification ---
      try {
        await sendEmailVerification(user);
        alert('Un email de vérification a été envoyé à votre adresse.');
      } catch (_verifErr) {
        console.warn('Erreur envoi email vérification :', _verifErr);
      }

      // --- 4. Mise à jour du profil Auth ---
      try {
        await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      } catch (_upErr) {
        console.warn('Erreur mise à jour profil Auth :', _upErr);
      }

      // --- 5. Création user dans Firestore (DB) ---
      try {
        await upsertUser({
          userId: user.uid,
          email: user.email ?? e,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      } catch (writeErr) {
        // Ici c'est important : si ça échoue, l'user est inscrit mais pas en base de données
        console.error('CRITIQUE: Erreur écriture Firestore :', writeErr);
      }

      const fullName =
        `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ').trim() ||
        user.displayName ||
        user.email ||
        e;

      if (Platform.OS === 'web') {
        notify('Compte créé avec succès', `Bienvenue, ${fullName} !`);
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Succès',
          `Compte créé pour ${user.email ?? e}`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }],
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