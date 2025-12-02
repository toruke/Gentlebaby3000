import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ROInput from '../../src/components/ROInput';
import { useCurrentUserProfile } from '../../src/hooks/useCurrentUserProfile';
import { router } from 'expo-router';
import Button from '@/src/components/Button';
import { Feather } from '@expo/vector-icons';
import React from 'react';

export default function Profil() {
  const { firstName, lastName, email, loading, needsEmailSync, isSyncing, syncEmail } =
    useCurrentUserProfile();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'capitalize',
  },

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
});
