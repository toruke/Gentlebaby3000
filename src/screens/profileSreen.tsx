import { router } from 'expo-router';
import React from 'react';
import BackgroundShapes from '../../src/components/backgroundShapes';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ROInput from '../../src/components/ROInput';
import { useCurrentUserProfile } from '../../src/hooks/useCurrentUserProfile';
import { logout } from '../services/auth';

export default function Profil() {
  const { firstName, lastName, email, loading } = useCurrentUserProfile();

  async function handleLogout() {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (e) {
      console.log('Erreur logout:', e);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BackgroundShapes style={styles.background} />

      <View style={styles.container}>
        <Text style={styles.title}>Mes informations</Text>
        <ROInput label="Prénom" value={firstName} />
        <ROInput label="Nom" value={lastName} />
        <ROInput label="Email" value={email} keyboardType="email-address" />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
  },

  container: { flex: 1, padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, textTransform: 'capitalize' },
  label: { marginBottom: 6, color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    color: '#111',
  },
  inputMuted: { backgroundColor: '#f0f0f0', color: '#777' },

  logoutBtn: {
    backgroundColor: '#b055afff',
    paddingVertical: 12,
    marginTop: 40,
    borderRadius: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});
