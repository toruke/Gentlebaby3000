// app/tutorRegistration.tsx
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createFamily, deleteFamilyPhoto } from '../services/familyService';

export default function TutorRegistration() {
  const [familyName, setFamilyName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDeleteImage = async () => {
    if (!image) return;
    try {
      await deleteFamilyPhoto(image);
      setImage(null);
      Alert.alert('Photo supprimée ✅');
    } catch {
      Alert.alert('Erreur', 'Impossible de supprimer la photo');
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de famille');
      return;
    }

    try {
      await createFamily(familyName, image || undefined);
      Alert.alert('Succès 🎉', 'Famille créée avec succès !');
      setFamilyName('');
      setImage(null);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la famille');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        Créer une famille 👨‍👩‍👧
      </Text>

      {/* 📸 Photo de profil */}
      <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center' }}>
        {image ? (
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Image
              source={{ uri: image }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 10,
              }}
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#e0e0e0',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text>📷</Text>
          </View>
        )}
      </TouchableOpacity>

      {image && (
        <TouchableOpacity
          onPress={handleDeleteImage}
          style={{ alignSelf: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: 'red' }}>🗑️ Supprimer la photo</Text>
        </TouchableOpacity>
      )}

      {/* 🔍 Zoom image */}
      <Modal visible={showModal} transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Image
              source={{ uri: image || undefined }}
              style={{ width: 300, height: 300, borderRadius: 10 }}
            />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 🏷️ Nom de la famille */}
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
          width: '100%',
        }}
      />

      {/* 🔘 Créer */}
      <TouchableOpacity
        onPress={handleCreateFamily}
        style={{
          backgroundColor: '#007bff',
          padding: 15,
          borderRadius: 8,
          width: '100%',
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          Créer la famille
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
