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

// Import du scanner et services
import { useDeviceDiscovery } from '@/src/hooks/useDeviceDiscovery';
import { DeviceScannerModal } from '@/src/components/deviceScannerModal';
import { linkDeviceToMember, unlinkDeviceFromMember } from '@/src/services/familyService';
import { DiscoveredDevice } from '@/src/models/device';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  // 🟢 On supporte les deux noms possibles pour éviter le bug d'affichage
  birthDate?: Timestamp | Date;
  birthday?: Timestamp | Date; 
  gender?: 'male' | 'female';
  photoUrl?: string;
  device?: string; 
}

export default function ChildProfileScreen() {
  const router = useRouter();
  const { childId, id: familyId } = useLocalSearchParams();

  const [child, setChild] = useState<Child | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);

  // --- SCANNER LOCAL ---
  const [isScannerVisible, setScannerVisible] = useState(false);
  const { startScanning, stopScanning, foundDevices } = useDeviceDiscovery();

  // FILTRE : Pour un enfant, on ne veut que des EMITTERS (Bébé)
  const filteredDevices = foundDevices.filter(d => d.type === 'EMITTER');

  // Fonction utilitaire pour formater la date proprement (Sans Any)
  const formatDate = (date: Timestamp | Date | undefined): string => {
    if (!date) return '—';

    let d: Date;
    // Type Guard : Vérification si c'est un Timestamp Firebase
    if (date instanceof Timestamp) {
      d = date.toDate();
    } else {
      d = date;
    }

    if (isNaN(d.getTime())) return 'Date invalide';
    
    return d.toLocaleDateString();
  };

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

        // Récupération directe dans la sous-collection children
        const childRef = doc(db, 'family', familyId as string, 'children', childId as string);
        const childSnap = await getDoc(childRef);

        if (childSnap.exists()) {
          const childData = childSnap.data();
          setChild({
            id: childSnap.id,
            // On spread les données, TypeScript fera le matching avec l'interface
            ...(childData as Omit<Child, 'id'>), 
          });
        } else {
          // Fallback legacy
          const babiesArray = Array.isArray(data?.babies) ? data.babies : Object.values(data?.babies || {});
          // On type l'élément trouvé comme 'unknown' puis 'Child' pour éviter le 'any' implicite
          const found = babiesArray.find((b: unknown) => (b as Child).id === childId);
          if (found) setChild(found as Child);
          else Alert.alert('Erreur', 'Enfant introuvable.');
        }

      } catch (e) {
        console.error(e);
        Alert.alert('Erreur', 'Impossible de charger le profil.');
      }
      setLoading(false);
    };

    loadChild();
  }, [childId, familyId]);

  const handleManageDevice = async () => {
    if (child?.device) {
      // DISSOCIATION
      Alert.alert('Dissocier', 'Retirer le babyphone de cet enfant ?', [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Dissocier', style: 'destructive',
          onPress: async () => {
            if (!child.id) return;
            await unlinkDeviceFromMember(familyId as string, child.id);
            setChild(prev => prev ? ({...prev, device: undefined}) : null);
            Alert.alert('Succès', 'Babyphone retiré.');
          },
        },
      ]);
    } else {
      // ASSOCIATION
      setScannerVisible(true);
      startScanning();
    }
  };

  const handleSelectDevice = async (device: DiscoveredDevice) => {
    if (!child || !familyId) return;
    try {
      stopScanning();
      await linkDeviceToMember(familyId as string, child.id, {
        serialNumber: device.id,
        type: device.type,
      });
      setScannerVisible(false);
      // Mise à jour locale
      setChild(prev => prev ? ({...prev, device: device.id}) : null);
      Alert.alert('Succès', 'Babyphone associé !');
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Association échouée.');
    }
  };

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
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      {/* MODALE SCANNER */}
      <DeviceScannerModal 
        visible={isScannerVisible}
        devices={filteredDevices}
        onClose={() => { setScannerVisible(false); stopScanning(); }}
        onSelectDevice={handleSelectDevice}
      />

      <View style={styles.modalContent}>
        
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          
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
              {/* 🟢 Utilisation de la fonction formatDate avec vérification des deux champs possibles */}
              <Text style={styles.value}>
                {formatDate(child.birthday || child.birthDate)}
              </Text>
            </View>

            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.label}>Babyphone</Text>
                <Text style={child.device ? styles.deviceActive : styles.deviceInactive}>
                  {child.device ? `#${child.device}` : 'Non associé'}
                </Text>
              </View>
               
              <TouchableOpacity
                style={[styles.addDeviceBtn, child.device ? {borderColor: '#E53E3E'} : {}]}
                onPress={handleManageDevice}
              >
                <Text style={[styles.addDeviceText, child.device ? {color: '#E53E3E'} : {}]}>
                  {child.device ? 'Dissocier' : 'Associer'}
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
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    paddingTop: 40,
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