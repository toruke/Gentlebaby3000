import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createFamily } from '../services/familyService';
import gtb2 from '../assets/images/gtb2.jpg';
import gtb3 from '../assets/images/gtb3.jpg';
import gtb4 from '../assets/images/gtb4.jpg';

export default function TutorRegistration() {
  const [familyName, setFamilyName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | undefined>(undefined);
  const [chosenDefault, setChosenDefault] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Tableau des photos par défaut
  const defaultPhotos = [gtb2, gtb3, gtb4];

  // ✅ Sélection d'une image compatible avec Expo SDK 49+ et TS
  const pickImage = async () => {
    // Dans pickImage
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission refusée', 'Vous devez autoriser l’accès à la galerie.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedPhoto(uri);
        setChosenDefault(-1); // -1 = photo personnalisée
      }
    } catch (err) {
      console.error('Erreur pickImage:', err); // <-- utiliser la variable pour ESLint
      Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie.');
    }
  };
  
  const removeImage = () => {
    setSelectedPhoto(undefined);
    setChosenDefault(0);
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de famille');
      return;
    }
    // Dans handleCreateFamily
    try {
      await createFamily(familyName); // ✅ on garde exactement le même appel
      Alert.alert('Succès', 'Famille créée avec succès 🎉');
      setFamilyName('');
      setSelectedPhoto(undefined);
      setChosenDefault(0);
    } catch (error) {
      console.error('Erreur createFamily:', error); // <-- utiliser la variable pour ESLint
      Alert.alert('Erreur', 'Impossible de créer la famille');
    }

  };

  const currentPhoto =
    selectedPhoto ||
    (chosenDefault >= 0 ? defaultPhotos[chosenDefault].uri : defaultPhotos[0].uri);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👨‍👩‍👧 Créer une famille</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Créer une famille</Text>

        {/* --- Photo --- */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Image source={{ uri: currentPhoto }} style={styles.profileImage} />
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.linkText}>Choisir une photo</Text>
          </TouchableOpacity>

          {selectedPhoto && (
            <TouchableOpacity onPress={removeImage}>
              <Text style={styles.removeText}>Supprimer la photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- Photos par défaut --- */}
        <FlatList
          data={defaultPhotos}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                setChosenDefault(index);
                setSelectedPhoto(undefined);
              }}
            >
              <Image
                source={item}
                style={[
                  styles.defaultImage,
                  chosenDefault === index && styles.selectedDefault,
                ]}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ justifyContent: 'center', marginBottom: 20 }}
        />

        {/* --- Nom de la famille --- */}
        <TextInput
          placeholder="Nom de la famille"
          value={familyName}
          onChangeText={setFamilyName}
          style={styles.input}
        />

        {/* --- Bouton créer --- */}
        <TouchableOpacity onPress={handleCreateFamily} style={styles.button}>
          <Text style={styles.buttonText}>Créer</Text>
        </TouchableOpacity>
      </View>

      {/* --- Modal aperçu photo --- */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Image source={{ uri: currentPhoto }} style={styles.modalImage} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  linkText: { marginTop: 8, color: '#007bff' },
  removeText: { color: 'red', marginTop: 6 },
  defaultImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDefault: { borderColor: '#007bff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: { backgroundColor: '#007bff', paddingVertical: 14, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16, textAlign: 'center' },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: { width: 250, height: 250, borderRadius: 125 },
});
