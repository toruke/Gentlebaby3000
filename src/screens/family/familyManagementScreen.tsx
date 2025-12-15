import { collection, doc, onSnapshot, Timestamp } from 'firebase/firestore';
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

type TabType = 'members' | 'children' | 'devices';

// 1. Définition du type pour un Membre (basé sur tes données Firestore)
interface Member {
  userId: string;
  role: string;
  displayName?: string;
  photoUrl?: string;
  email?: string;
  devices?: string | null;
}

// 2. Définition du type pour un Appareil (Device)
interface DeviceItem {
  deviceId: string;
  serialNumber?: string;
  type?: 'EMITTER' | 'RECEIVER';
  status?: 'online' | 'offline' | 'pairing';
  pairedAt?: Timestamp; // Tu peux mettre Timestamp si tu l'importes, sinon any ou Date
  lastSeen?: Timestamp;
}

interface FamilyData {
  id: string;
  name: string;
  babies: Child[];
  members: Member[]; // CORRECTION : Typage strict ici
  devices: DeviceItem[]; // CORRECTION : Typage strict ici
}

export default function ManagementScreen({ familyId }: { familyId?: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;

    setLoading(true);

    // 1. Écoute du Document Principal (Info Famille + Enfants)
    const familyRef = doc(db, 'family', familyId);
    const unsubFamily = onSnapshot(familyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // On met à jour le state partiellement
        setFamilyData(prev => ({
          id: docSnap.id,
          name: data.name || 'Ma Famille',
          babies: data.babies || [], 
          members: prev?.members || [], 
          devices: prev?.devices || [], 
        }));
      } else {
        setLoading(false);
      }
    });

    // 2. Écoute de la Sous-collection 'members'
    const membersRef = collection(db, 'family', familyId, 'members');
    const unsubMembers = onSnapshot(membersRef, (querySnap) => {
      // CORRECTION : On type le tableau temporaire
      const membersList: Member[] = []; 
      
      querySnap.forEach((doc) => {
        const data = doc.data();
        // On pousse un objet qui respecte l'interface Member
        membersList.push({ 
          userId: doc.id,
          role: data.role || 'membre',
          displayName: data.displayName,
          photoUrl: data.photoUrl,
          email: data.email,
          devices: data.devices,
        });
      });

      // On met à jour juste la partie membres
      setFamilyData(prev => {
        if (!prev) return null;
        return { ...prev, members: membersList };
      });
      setLoading(false);
    });

    // 3. Écoute de la Sous-collection 'devices'
    const devicesRef = collection(db, 'family', familyId, 'devices');
    const unsubDevices = onSnapshot(devicesRef, (querySnap) => {
      // CORRECTION : On type le tableau temporaire
      const devicesList: DeviceItem[] = [];
      
      querySnap.forEach((doc) => {
        const data = doc.data();
        // On pousse un objet qui respecte l'interface DeviceItem
        devicesList.push({
          deviceId: doc.id,
          serialNumber: data.serialNumber,
          type: data.type,
          status: data.status,
          pairedAt: data.pairedAt,
          lastSeen: data.lastSeen,
        });
      });
        
      setFamilyData(prev => {
        if (!prev) return null;
        return { ...prev, devices: devicesList };
      });
    });

    // Nettoyage des 3 écoutes quand on quitte l'écran
    return () => {
      unsubFamily();
      unsubMembers();
      unsubDevices();
    };
  }, [familyId]);


  // --- ACTIONS ---
  const handleInviteMember = () => {
    Alert.alert('Inviter un membre', 'Fonctionnalité d\'invitation à venir.');
  };

  if (loading) return <ActivityIndicator size="large" color="#6b46c1" style={styles.center} />;
  if (!familyData) return <View style={styles.center}><Text>Famille introuvable</Text></View>;

  const membersCount = familyData.members?.length || 0;
  const childrenCount = familyData.babies?.length || 0;
  const devicesCount = familyData.devices?.length || 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{familyData.name}</Text>
        <Text style={styles.headerSubtitle}>Tableau de bord de gestion</Text>
      </View>

      {/* BARRE D'ONGLETS */}
      <View style={styles.tabBar}>
        <TabButton label={`Membres (${membersCount})`} isActive={activeTab === 'members'} onPress={() => setActiveTab('members')} />
        <TabButton label={`Enfants (${childrenCount})`} isActive={activeTab === 'children'} onPress={() => setActiveTab('children')} />
        <TabButton label={`Appareils (${devicesCount})`} isActive={activeTab === 'devices'} onPress={() => setActiveTab('devices')} />
      </View>

      {/* CONTENU */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'members' && (
          <MembersTab 
            members={familyData.members} 
            onInvite={handleInviteMember} 
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
            // Si ton DevicesTab gère lui-même le scan, tu peux enlever cette prop si elle n'est pas requise, 
            // mais ici je la laisse pour correspondre à tes types précédents.
            // Assure-toi que DevicesTab accepte familyId :
            familyId={familyData.id} 
          />
        )}
      </ScrollView>
    </View>
  );
}

const TabButton = ({ label, isActive, onPress }: { label: string, isActive: boolean, onPress: () => void }) => (
  <TouchableOpacity style={[styles.tabItem, isActive && styles.tabItemActive]} onPress={onPress}>
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#6b46c1', paddingVertical: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#e2e8f0', opacity: 0.8 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', elevation: 4 },
  tabItem: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#6b46c1' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#718096' },
  tabTextActive: { color: '#6b46c1' },
  contentContainer: { padding: 20 },
});