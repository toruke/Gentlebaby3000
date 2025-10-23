// src/screens/FamilyWelcomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FamilyWelcomeScreen() {
  const router = useRouter();
  const { familyName } = useLocalSearchParams<{ familyName?: string }>(); // ✅ utilisation correcte

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🎉 Bienvenue à la famille {familyName ?? '...'} !
      </Text>
      <Text style={styles.subtitle}>
        Votre espace familial a été créé avec succès.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/family/family-welcome')}
      >
        <Text style={styles.buttonText}>Aller à l’accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 30 },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
