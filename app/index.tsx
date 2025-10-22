import Button from '@/src/components/Button';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur GentleBaby3000</Text>
      <Button title="Créer un compte" onPress={() => router.push('/signup')} />
      <View style={{ height: 20 }} />
      <Button title="Mon Profil" onPress={() => router.push('/profils')} />
      <View style={styles.inviteContainer}>
        <Button
          title="InviteGeneral"
          onPress={() => router.push('/invite')}
        />
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20, 
  },
  inviteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: 40,
  },
});
