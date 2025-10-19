import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createFamily } from '../services/familyService';

export default function TutorRegistration() {
  const [familyName, setFamilyName] = useState('');

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de famille');
      return;
    }

    try {
      await createFamily(familyName);
      Alert.alert('Succès', 'Famille créée avec succès 🎉');
      setFamilyName('');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de créer la famille');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Créer une famille
      </Text>

      <TextInput
        placeholder="Nom de la famille"
        value={familyName}
        onChangeText={setFamilyName}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleCreateFamily}
        style={{
          backgroundColor: '#007bff',
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
          Créer
        </Text>
      </TouchableOpacity>
    </View>
  );
}
