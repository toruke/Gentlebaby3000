import { router } from 'expo-router';
import { fetchSignInMethodsForEmail, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { auth } from '../config/firebaseConfig';
import { signUp } from '../src/services/auth';
import { upsertUser } from '../src/services/user';

function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    const e = email.trim();

    if (!firstName.trim()) return notify('Erreur', 'Prénom requis.');
    if (!lastName.trim()) return notify('Erreur', 'Nom requis.');
    if (!isValidEmail(e)) return notify('Erreur', 'Email invalide.');
    if (password.length < 6) return notify('Erreur', 'Mot de passe trop court (6+).');
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
          [{ text: 'OK', onPress: () => router.replace('/') }],
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <Text>Prénom</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />

      <Text>Nom</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />

      <Text>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        inputMode="email"
        autoComplete="email"
      />

      <Text>Mot de passe</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />

      <Text>Confirmer le mot de passe</Text>
      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
      />

      <View style={{ marginTop: 8 }}>
        <Button
          title={loading ? 'Création...' : 'Créer un compte'}
          onPress={handleSignUp}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 6 },
});
