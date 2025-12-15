import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

// Import de tes composants et services réels
import { DeviceScannerModal } from '@/src/components/deviceScannerModal';
import { useDeviceDiscovery } from '@/src/hooks/useDeviceDiscovery'; 
import { linkDeviceToMember } from '@/src/services/familyService';
import { DiscoveredDevice } from '@/src/models/device';
import { auth } from '@/config/firebaseConfig';

// 1. Définition de l'interface pour typer les appareils (fini les 'any')
interface DeviceItem {
  deviceId?: string;
  type?: string;
  status?: string;
  serialNumber?: string;
}

interface DevicesTabProps {
  devices: DeviceItem[]; // Typage strict
  familyId: string;
}

export default function DevicesTab({ devices, familyId }: DevicesTabProps) {
  const [isModalVisible, setModalVisible] = useState(false);
  
  const { 
    startScanning, 
    stopScanning, 
    foundDevices,
    isScanning, 
  } = useDeviceDiscovery();

  const handleOpenScanner = () => {
    setModalVisible(true);
    startScanning();
  };

  const handleCloseScanner = () => {
    setModalVisible(false);
    stopScanning();
  };

  const handleSelectDevice = async (device: DiscoveredDevice) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté.');
      return;
    }

    try {
      stopScanning();
      
      await linkDeviceToMember(familyId, user.uid, {
        serialNumber: device.id,
        type: device.type,
      });

      Alert.alert('Succès', 'Appareil associé avec succès !');
      setModalVisible(false);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d\'associer l\'appareil.');
      startScanning();
    }
  };

  const hasDevices = devices && devices.length > 0;

  return (
    <View style={styles.container}>
      
      <DeviceScannerModal 
        visible={isModalVisible}
        devices={foundDevices}
        onClose={handleCloseScanner}
        onSelectDevice={handleSelectDevice}
      />

      <TouchableOpacity 
        style={styles.deviceActionButton}
        onPress={handleOpenScanner} 
        disabled={isScanning && !isModalVisible}
      >
        <Text style={styles.deviceActionText}>🔍 Trouver et associer un appareil</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Appareils associés</Text>

      {!hasDevices ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun appareil associé à la famille.</Text>
          <Text style={styles.emptySubText}>Associez un babyphone pour commencer à surveiller.</Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item, index) => item.deviceId || index.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 24 }}>
                  {item.type === 'EMITTER' ? '👶' : '👂'}
                </Text> 
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.type === 'EMITTER' ? 'Émetteur (Bébé)' : 'Récepteur (Parent)'}
                </Text>
                <Text style={styles.itemSub}>ID: {item.deviceId}</Text>
              </View>
              
              <View style={[styles.statusContainer, { backgroundColor: item.status === 'online' ? '#C6F6D5' : '#FED7D7' }]}>
                <Text style={{ color: item.status === 'online' ? '#22543D' : '#822727', fontSize: 10, fontWeight:'bold' }}>
                  {item.status === 'online' ? 'EN LIGNE' : 'HORS LIGNE'}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginTop: 25, marginBottom: 15 },
  
  deviceActionButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2, 
    borderColor: '#CBD5E0',
    borderStyle: 'dashed',
  },
  deviceActionText: { color: '#4A5568', fontSize: 16, fontWeight: '700' },

  emptyContainer: { marginTop: 10, padding: 10 },
  emptyText: { color: '#4A5568', fontSize: 16, marginBottom: 4 },
  emptySubText: { color: '#A0AEC0', fontSize: 14 },

  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 14, marginRight: 16,
    backgroundColor: '#F7FAFC', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#EDF2F7',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  itemSub: { fontSize: 14, color: '#718096' },
  
  statusContainer: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});