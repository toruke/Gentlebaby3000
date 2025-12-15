import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '../../../config/firebaseConfig';
import defaultAvatarGirl from '../../../assets/images/default-avatar-girl.png';
import defaultAvatar from '../../../assets/images/default-avatar.png';

// Typage
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
  const router = useRouter();
  const { childId, id: familyId } = useLocalSearchParams();

  const [child, setChild] = useState<Child | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);

  // Charger enfant
  useEffect(() => {
    if (!familyId || !childId) return;

    const loadChild = async () => {
      try {
        const familyRef = doc(db, 'family', familyId as string);
        const snap = await getDoc(familyRef);

        if (!snap.exists()) {
          Alert.alert('Erreur', 'Famille introuvable.');
          return;
        }

        const data = snap.data();
        setFamilyName(data?.name || '');
        setTutorName(data?.createdByName || '—');

        const babiesArray = Array.isArray(data?.babies)
          ? data.babies
          : Object.values(data?.babies || {});

        const found = babiesArray.find((b: Child) => b.id === childId);
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

  const pickLocalPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Autorisation refusée', 'Veuillez autoriser l\'accès aux photos.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setLocalPhoto(result.assets[0].uri);
    }
  };

  if (loading || !child) {
    return (
      <View style={[styles.overlayContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const avatarSource = localPhoto
    ? { uri: localPhoto }
    : child.gender === 'female' ? defaultAvatarGirl : defaultAvatar;

  return (
    <View style={styles.overlayContainer}>
      {/* 1. Zone cliquable pour fermer */}
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      {/* 2. La carte Modale */}
      <View style={styles.modalContent}>
        
        {/* Croix de fermeture */}
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          
          {/* Avatar centré */}
          <View style={styles.avatarContainer}>
            <Image source={avatarSource} style={styles.photo} />
            <TouchableOpacity style={styles.changePhotoBadge} onPress={pickLocalPhoto}>
              <Text style={styles.changePhotoIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>
            {child.firstName} {child.lastName}
          </Text>
          <Text style={styles.subHeader}>Profil Enfant</Text>

          {/* Section Infos */}
          <View style={styles.infoSection}>
            <View style={styles.row}>
              <Text style={styles.label}>Famille</Text>
              <Text style={styles.value}>{familyName}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Tuteur</Text>
              <Text style={styles.value}>{tutorName}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Naissance</Text>
              <Text style={styles.value}>
                {child.birthDate?.toDate().toLocaleDateString()}
              </Text>
            </View>

            {/* Babyphone */}
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.label}>Babyphone</Text>
                <Text style={child.deviceId ? styles.deviceActive : styles.deviceInactive}>
                  {child.deviceId ? `#${child.deviceId}` : 'Non associé'}
                </Text>
              </View>
               
              <TouchableOpacity
                style={styles.addDeviceBtn}
                onPress={() => Alert.alert('Info', 'Bientôt disponible')}
              >
                <Text style={styles.addDeviceText}>
                  {child.deviceId ? 'Gérer' : 'Associer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fond sombre transparent
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  // Carte
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    paddingTop: 40, // Espace pour l'avatar qui dépasse un peu si on veut (optionnel) ou juste aéré
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  closeIcon: {
    fontSize: 20,
    color: '#CBD5E0',
  },
  // Avatar
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#E9D8FD',
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6b46c1',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoIcon: { fontSize: 12 },
  
  // Textes
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2D3748',
  },
  subHeader: {
    fontSize: 14,
    textAlign: 'center',
    color: '#A0AEC0',
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Infos
  infoSection: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  label: {
    fontSize: 14,
    color: '#718096',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  
  // Device specific
  deviceActive: { color: '#48BB78', fontWeight: 'bold', fontSize: 13, marginTop: 2 },
  deviceInactive: { color: '#A0AEC0', fontStyle: 'italic', fontSize: 13, marginTop: 2 },
  
  addDeviceBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addDeviceText: {
    fontSize: 12,
    color: '#6b46c1',
    fontWeight: '600',
  },
});