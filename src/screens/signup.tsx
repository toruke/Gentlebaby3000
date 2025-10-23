import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignUp } from '../hooks/useSignUp';

export default function SignUpScreen() {
  const {
    firstName, lastName, email, password, confirm, loading,
    setFirstName, setLastName, setEmail, setPassword, setConfirm,
    onSubmit,
  } = useSignUp();

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
          onPress={onSubmit}
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
