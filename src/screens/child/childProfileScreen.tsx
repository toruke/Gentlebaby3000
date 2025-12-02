import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { db, storage } from '../../../config/firebaseConfig';
import BackgroundShapes from '../../../src/components/backgroundShapes';

// 🔥 Import images au lieu de require()
import defaultAvatarGirl from '../../../assets/images/default-avatar-girl.png';
import defaultAvatar from '../../../assets/images/default-avatar.png';

// Typage propre pour ESLint
interface Child {
    id: string;
    firstName: string;
    lastName: string;
    birthDate?: Timestamp;
    gender?: 'male' | 'female';
    photoUrl?: string;
    deviceId?: string;
}

export default function ChildProfileScreen() {
  const { childId, id: familyId } = useLocalSearchParams();

  const [child, setChild] = useState<Child | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!familyId || !childId) return;

    const loadChild = async () => {
      try {
        const familyRef = doc(db, 'family', familyId as string);
        const familySnap = await getDoc(familyRef);

        if (!familySnap.exists()) {
          Alert.alert('Erreur', 'Famille introuvable.');
          return;
        }

        const data = familySnap.data();
        setFamilyName(data.name || '');
        setTutorName(data.createdByName || '—');

        const babies = data.babies || [];
        const found = babies.find((b: Child) => b.id === childId);

        if (!found) {
          Alert.alert('Erreur', 'Enfant introuvable.');
          return;
        }

        setChild(found);
      } catch {
        Alert.alert('Erreur', 'Impossible de charger le profil.');
      }
      setLoading(false);
    };

    loadChild();
  }, [childId, familyId]);

  const changePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission refusée', 'Autorisez l’accès à la galerie.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled || !child) return;

      setUploading(true);

      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `childPhotos/${child.id}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      const familyRef = doc(db, 'family', familyId as string);
      const snap = await getDoc(familyRef);
      const data = snap.data();

      const updatedBabies = data.babies.map((b: Child) =>
        b.id === child.id ? { ...b, photoUrl: downloadURL } : b,
      );

      await updateDoc(familyRef, { babies: updatedBabies });

      setChild({ ...child, photoUrl: downloadURL });

      Alert.alert('Succès', 'Photo mise à jour !');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !child) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8E59FF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.bgWrapper}>
        <BackgroundShapes />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={styles.card}>

          <Image
            source={
              child.photoUrl
                ? { uri: child.photoUrl }
                : child.gender === 'female'
                  ? defaultAvatarGirl
                  : defaultAvatar
            }
            style={styles.photo}
          />

          <TouchableOpacity
            style={styles.changePhotoBtn}
            onPress={changePhoto}
            disabled={uploading}
          >
            <Text style={styles.changePhotoText}>
              {uploading ? 'Téléchargement...' : 'Changer la photo'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.name}>
            {child.firstName} {child.lastName}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Nom de famille</Text>
            <Text style={styles.value}>{familyName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tuteur principal</Text>
            <Text style={styles.value}>{tutorName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date de naissance</Text>
            <Text style={styles.value}>
              {child.birthDate?.toDate().toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Babyphone</Text>

            {child.deviceId ? (
              <Text style={[styles.value, { color: '#4A7FFF', fontWeight: '700' }]}>
                                Babyphone #{child.deviceId}
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.addDeviceButton}
                onPress={() =>
                  Alert.alert(
                    'Bientôt disponible 💜',
                    'Vous pourrez associer un babyphone dans une prochaine version.',
                  )
                }
              >
                <Text style={styles.addDeviceText}>+ Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgWrapper: {
    position: 'absolute',
    top: -140,
    left: 0,
    right: 0,
    height: 380,
    zIndex: -1,
  },
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: 40,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 25,
    paddingBottom: 100,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#E8D9FF',
  },
  changePhotoBtn: {
    alignSelf: 'center',
    backgroundColor: '#F2E9FF',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 5,
  },
  changePhotoText: {
    color: '#8E59FF',
    fontWeight: '600',
    fontSize: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: { color: '#666', fontSize: 14 },
  value: { fontWeight: '600', maxWidth: 190, textAlign: 'right', fontSize: 14 },
  addDeviceButton: {
    backgroundColor: '#F2E9FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addDeviceText: {
    color: '#8E59FF',
    fontWeight: '600',
    fontSize: 13,
  },
});
