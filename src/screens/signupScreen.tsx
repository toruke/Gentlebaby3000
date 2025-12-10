import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp } from '../hooks/useSignUp';
import InputField from '../components/form/inputField';
import PrimaryButton from '../components/form/primaryButton';
import FormLink from '../components/form/formLink';

export default function SignUpScreen() {
  const {
    firstName, lastName, email, password, confirm, loading,
    setFirstName, setLastName, setEmail, setPassword, setConfirm,
    onSubmit,
  } = useSignUp();
  
  const router = useRouter();

  const isFormValid = firstName && lastName && email && password && confirm;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Créer un compte</Text>

      <InputField
        label="Prénom"
        placeholder="Votre prénom"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        autoComplete="name-given"
      />

      <InputField
        label="Nom"
        placeholder="Votre nom"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        autoComplete="name-family"
      />

      <InputField
        label="Email"
        placeholder="votre@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <InputField
        label="Mot de passe"
        placeholder="Choisissez un mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />

      <InputField
        label="Confirmer le mot de passe"
        placeholder="Confirmez votre mot de passe"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
      />

      <PrimaryButton
        title="Créer un compte"
        onPress={onSubmit}
        loading={loading}
        disabled={!isFormValid}
      />

      <FormLink
        text="Déjà un compte ?"
        highlightText="Se connecter"
        onPress={() => router.push('/auth/login')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1e293b',
  },
});