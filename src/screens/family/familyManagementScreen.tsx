import { collection, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '@/config/firebaseConfig';
import { Child } from '@/src/models/child'; 

// Import des composants
import ChildrenTab from '@/src/components/management/childrenTab';
import DevicesTab from '@/src/components/management/devicesTab';
import MembersTab from '@/src/components/management/membersTab';

import { useDeviceDiscovery } from '@/src/hooks/useDeviceDiscovery';
import { DeviceScannerModal } from '@/src/components/deviceScannerModal';
import { linkDeviceToMember, unlinkDeviceFromMember} from '@/src/services/familyService';
import { DiscoveredDevice } from '@/src/models/device';

type TabType = 'members' | 'children' | 'devices';

interface Member {
  userId: string;
  role: string;
  displayName?: string;
  photoUrl?: string;
  email?: string;
  device?: string | null;
}

interface DeviceItem {
  deviceId: string;
  serialNumber?: string;
  type?: 'EMITTER' | 'RECEIVER';
  status?: string;
  pairedAt?: unknown;
  lastSeen?: unknown;
  [key: string]: unknown;
}

interface FamilyData {
  id: string;
  name: string;
  babies: Child[]; 
  members: Member[];
  devices: DeviceItem[];
}

export default function ManagementScreen({ familyId }: { familyId?: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- SCANNER UDP ---
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  
  const { startScanning, stopScanning, foundDevices } = useDeviceDiscovery();
  const filteredDevices = foundDevices.filter(d => d.type === 'RECEIVER');

  useEffect(() => {
    if (!familyId) return;

    setLoading(true);

    // 1. Écoute du document FAMILLE (Pour le nom seulement)
    const familyRef = doc(db, 'family', familyId);
    const unsubFamily = onSnapshot(familyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFamilyData(prev => ({
          id: docSnap.id,
          name: data.name || 'Ma Famille',
          babies: prev?.babies || [], 
          members: prev?.members || [], 
          devices: prev?.devices || [], 
        }));
      } else {
        setLoading(false);
      }
    });

    // 2. Écoute de la Sous-Collection CHILDREN
    const childrenRef = collection(db, 'family', familyId, 'children');
    const unsubChildren = onSnapshot(childrenRef, (querySnap) => {
      const childrenList: Child[] = [];
      querySnap.forEach((doc) => {
        const d = doc.data();
        childrenList.push({
          id: doc.id,
          childId: doc.id,
          firstName: d.firstName,
          lastName: d.lastName,
          gender: d.gender,
          photoUrl: d.photoUrl, 
          birthday: d.birthday,
          device: d.device,
        } as Child);
      });

      setFamilyData(prev => {
        if (!prev) return null;
        return { ...prev, babies: childrenList };
      });
      setLoading(false); 
    });

    // 3. Écoute Membres
    const membersRef = collection(db, 'family', familyId, 'members');
    const unsubMembers = onSnapshot(membersRef, (querySnap) => {
      const membersList: Member[] = []; 
      querySnap.forEach((doc) => {
        const d = doc.data();
        membersList.push({ 
          userId: doc.id, 
          role: d.role,
          displayName: d.displayName,
          photoUrl: d.photoUrl,
          email: d.email,
          device: d.device || d.devices, 
        });
      });

      setFamilyData(prev => {
        if (!prev) return null;
        return { ...prev, members: membersList };
      });
    });

    // 4. Écoute Appareils
    const devicesRef = collection(db, 'family', familyId, 'devices');
    const unsubDevices = onSnapshot(devicesRef, (querySnap) => {
      const devicesList: DeviceItem[] = [];
      querySnap.forEach((doc) => {
        const d = doc.data();
        devicesList.push({
          deviceId: doc.id,
          serialNumber: d.serialNumber,
          type: d.type,
          status: d.status,
          pairedAt: d.pairedAt,
          lastSeen: d.lastSeen,
        });
      });
        
      setFamilyData(prev => {
        if (!prev) return null;
        return { ...prev, devices: devicesList };
      });
    });

    return () => {
      unsubFamily();
      unsubChildren();
      unsubMembers();
      unsubDevices();
    };
  }, [familyId]);

  // --- ACTIONS ---

  const handleInviteMember = () => {
    Alert.alert('Inviter un membre', 'Fonctionnalité d\'invitation à venir.');
  };

  const handleManageDeviceMember = (member: Member) => {
    if (member.device) {
      Alert.alert(
        'Dissocier l\'appareil',
        `Voulez-vous retirer l'appareil de ${member.displayName} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Dissocier', 
            style: 'destructive',
            onPress: async () => {
              try {
                if (!familyId) return;
                await unlinkDeviceFromMember(familyId, member.userId);
                Alert.alert('Succès', 'Appareil dissocié.');
              } catch (e) {
                console.error(e);
                Alert.alert('Erreur', 'Impossible de dissocier.');
              }
            },
          },
        ],
      );
    } else {
      setTargetMemberId(member.userId);
      setScannerVisible(true);
      startScanning();
    }
  };

  const handleSelectDeviceFromScanner = async (device: DiscoveredDevice) => {
    if (!targetMemberId || !familyId) return;
    try {
      stopScanning();
      await linkDeviceToMember(familyId, targetMemberId, {
        serialNumber: device.id,
        type: device.type,
      });
      setScannerVisible(false);
      setTargetMemberId(null);
      Alert.alert('Succès', 'Babyphone associé au membre !');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Échec de l\'association.');
      startScanning();
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#6b46c1" style={styles.center} />;
  if (!familyData) return <View style={styles.center}><Text>Famille introuvable</Text></View>;

  const membersCount = familyData.members?.length || 0;
  const childrenCount = familyData.babies?.length || 0;
  const devicesCount = familyData.devices?.length || 0;

  return (
    <View style={styles.container}>
      <DeviceScannerModal
        visible={isScannerVisible}
        devices={filteredDevices}
        onClose={() => {
          setScannerVisible(false);
          stopScanning();
          setTargetMemberId(null);
        }}
        onSelectDevice={handleSelectDeviceFromScanner}
      />

      <View style={styles.tabBar}>
        <TabButton label={`Membres (${membersCount})`} isActive={activeTab === 'members'} onPress={() => setActiveTab('members')} />
        <TabButton label={`Enfants (${childrenCount})`} isActive={activeTab === 'children'} onPress={() => setActiveTab('children')} />
        <TabButton label={`Appareils (${devicesCount})`} isActive={activeTab === 'devices'} onPress={() => setActiveTab('devices')} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'members' && (
          <MembersTab 
            members={familyData.members}
            familyId={familyData.id} 
            onInvite={handleInviteMember}
            onManageDevice={handleManageDeviceMember} 
          />
        )}

        {activeTab === 'children' && (
          <ChildrenTab 
            childrenData={familyData.babies} 
            familyId={familyData.id} 
          />
        )}

        {activeTab === 'devices' && (
          <DevicesTab 
            devices={familyData.devices} 
            familyId={familyData.id} 
          />
        )}
      </ScrollView>
    </View>
  );
}

// 🟢 Composant TabButton (qui était manquant dans votre version)
const TabButton = ({ label, isActive, onPress }: { label: string, isActive: boolean, onPress: () => void }) => (
  <TouchableOpacity style={[styles.tabItem, isActive && styles.tabItemActive]} onPress={onPress}>
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', elevation: 4 },
  tabItem: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#6b46c1' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#718096' },
  tabTextActive: { color: '#6b46c1' },
  contentContainer: { padding: 20 },
});