import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
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

import { db } from '../../../config/firebaseConfig';
import BackgroundShapes from '../../../src/components/backgroundShapes';

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
  const { childId, id: familyId } = useLocalSearchParams();

  const [child, setChild] = useState<Child | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [loading, setLoading] = useState(true);

  // Photo locale (non sauvegardée)
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

  // Choisir une photo locale
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
      <View style={styles.center}>
        <ActivityIndicator testID="loading-spinner" size="large" color="#8E59FF" />
      </View>
    );
  }

  const avatarSource = localPhoto
    ? { uri: localPhoto }
    : child.gender === 'female'
      ? defaultAvatarGirl
      : defaultAvatar;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.bgWrapper}>
        <BackgroundShapes />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={styles.card}>
          {/* Image */}
          <Image source={avatarSource} style={styles.photo} />

          {/* Bouton changer photo */}
          <TouchableOpacity style={styles.changePhotoBtn} onPress={pickLocalPhoto}>
            <Text style={styles.changePhotoText}>Changer la photo</Text>
          </TouchableOpacity>

          <Text style={styles.name}>
            {child.firstName} {child.lastName}
          </Text>

          {/* Nom de famille */}
          <View style={styles.row}>
            <Text style={styles.label}>Nom de famille</Text>
            <Text style={styles.value}>{familyName}</Text>
          </View>

          {/* Tuteur principal */}
          <View style={styles.row}>
            <Text style={styles.label}>Tuteur principal</Text>
            <Text style={styles.value}>{tutorName}</Text>
          </View>

          {/* Date de naissance */}
          <View style={styles.row}>
            <Text style={styles.label}>Date de naissance</Text>
            <Text style={styles.value}>
              {child.birthDate?.toDate().toLocaleDateString()}
            </Text>
          </View>

          {/* Babyphone (aligné) */}
          <View style={styles.rowBabyphone}>
            <Text style={styles.label}>Babyphone</Text>

            <View style={styles.babyphoneRight}>
              <Text
                style={
                  child.deviceId
                    ? styles.babyphoneTextActive
                    : styles.babyphoneTextInactive
                }
              >
                {child.deviceId
                  ? `Babyphone #${child.deviceId}`
                  : 'Aucun babyphone associé'}
              </Text>

              <TouchableOpacity
                style={styles.addDeviceBtn}
                onPress={() =>
                  Alert.alert(
                    'Bientôt disponible ',
                    'Vous pourrez associer un babyphone dans une prochaine version.',
                  )
                }
              >
                <Text style={styles.addDeviceText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>
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

  /* ROW CLASSIQUE */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  /* ROW BABYPHONE (alignée) */
  rowBabyphone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  babyphoneRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  babyphoneTextInactive: {
    color: '#999',
    marginRight: 10,
    fontSize: 14,
    fontWeight: '600',
  },

  babyphoneTextActive: {
    color: '#4A7FFF',
    marginRight: 10,
    fontSize: 14,
    fontWeight: '700',
  },

  addDeviceBtn: {
    backgroundColor: '#F2E9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addDeviceText: {
    color: '#8E59FF',
    fontWeight: '600',
    fontSize: 13,
  },

  label: {
    color: '#666',
    fontSize: 14,
  },
  value: {
    fontWeight: '600',
    maxWidth: 190,
    textAlign: 'right',
    fontSize: 14,
  },
});
