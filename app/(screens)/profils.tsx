import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ROInput from '../../src/components/ROInput';
import { useCurrentUserProfile } from '../../src/hooks/useCurrentUserProfile';

export default function Profil() {
  const { firstName, lastName, email, loading } = useCurrentUserProfile();

  if (loading) {
    return <View style={styles.center}><Text>Chargement…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes informations</Text>
      <ROInput label="Prénom" value={firstName} />
      <ROInput label="Nom" value={lastName} />
      <ROInput label="Email" value={email} keyboardType="email-address" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, textTransform: 'capitalize' },
  label: { marginBottom: 6, color: '#444' },
  input: {
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, color: '#111',
  },
  inputMuted: { backgroundColor: '#f0f0f0', color: '#777' },
});
