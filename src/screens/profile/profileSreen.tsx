import Button from '@/src/components/Button';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import BackgroundShapes from '../../components/backgroundShapes';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ROInput from '../../components/ROInput';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile';
import { logout } from '../../services/auth';

export default function Profil() {
  const { firstName, lastName, email, loading, needsEmailSync, isSyncing, syncEmail } =
    useCurrentUserProfile();

  async function handleLogout() {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (e) {
      // CORRECTION : On utilise la variable 'e' et on remplit le bloc vide
      console.error('Erreur lors de la déconnexion :', e);
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
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Mes informations</Text>
          <TouchableOpacity
            onPress={() => router.push('/user/EditingProfileUser')}
            style={styles.editBtn}
          >
            <Feather name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ROInput label="Prénom" value={firstName} />
        <ROInput label="Nom" value={lastName} />
        <ROInput label="Email" value={email} keyboardType="email-address" />
        {needsEmailSync && (
          <View style={styles.syncContainer}>
            <Text style={styles.syncText}>
              Veuillez synchroniser votre Mail.
            </Text>

            <Button
              title={isSyncing ? 'Synchronisation...' : 'Synchroniser l\'e-mail'}
              onPress={syncEmail}
              disabled={isSyncing}
            />
          </View>
        )}
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


  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  syncContainer: {
    backgroundColor: '#fff8e1',
    borderLeftColor: '#f9a825',
    borderLeftWidth: 4,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 20,
    borderRadius: 6,
  },

  syncText: {
    color: '#e65100',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
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