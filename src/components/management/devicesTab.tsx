import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

import { DeviceScannerModal } from '@/src/components/deviceScannerModal';
import { BleConfigModal } from '@/src/components/bleConfigModal';
import { useDeviceDiscovery } from '@/src/hooks/useDeviceDiscovery'; 
// Assurez-vous que linkDeviceToFamily est bien importé si vous l'utilisez
import { linkDeviceToMember, unlinkDeviceFromFamily, linkDeviceToFamily, unlinkDeviceFromMember } from '@/src/services/familyService'; 
import { DiscoveredDevice } from '@/src/models/device';
import { auth } from '@/config/firebaseConfig';

interface DeviceItem {
  deviceId: string;
  type?: string;
  status?: string;
  serialNumber?: string;
}

interface DevicesTabProps {
  devices: DeviceItem[];
  familyId: string;
}

export default function DevicesTab({ devices, familyId }: DevicesTabProps) {
  const [isScannerVisible, setScannerVisible] = useState<boolean>(false);
  const [isConfigModalVisible, setConfigModalVisible] = useState<boolean>(false);

  const { startScanning, stopScanning, foundDevices } = useDeviceDiscovery();

  // --- LOGIQUE ASSOCIATION (UDP) ---
  const handleOpenScanner = () => {
    setScannerVisible(true);
    startScanning();
  };

  const handleSelectDevice = async (device: DiscoveredDevice) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      stopScanning();
      
      // Utilisation de linkDeviceToFamily pour UDP selon votre logique
      await linkDeviceToFamily(familyId, {
        serialNumber: device.id,
        type: device.type,
      });
      
      Alert.alert('Succès', 'Appareil associé à votre compte !');
      setScannerVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d\'associer.');
      startScanning(); 
    }
  };

  // --- CALLBACKS CONFIG BLE ---
  
  // FIX LINTER : Typage explicite des arguments
  const handleBleSuccess = async (deviceId: string, type: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Lien immédiat après configuration du Wi-Fi
      await linkDeviceToMember(familyId, user.uid, {
        serialNumber: deviceId,
        type: type, 
      });
    } catch (error) {
      console.error('Erreur lien Firebase après BLE:', error);
      Alert.alert('Attention', 'Wi-Fi configuré, mais échec de l\'enregistrement en BDD.');
    }
  };

  const handleBleReset = async (_deviceId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      await unlinkDeviceFromMember(familyId, user.uid);
    } catch (e) { 
      console.log('Erreur dissociation après reset BLE:', e); 
    }
  };

  // --- LOGIQUE DISSOCIATION ---
  const handleDeviceRemove = async (deviceId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment dissocier l'appareil ${deviceId} de la famille ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await unlinkDeviceFromFamily(familyId, deviceId);
              Alert.alert('Succès', 'Appareil dissocié de la famille.');
            } catch (e) {
              console.error(e);
              Alert.alert('Erreur', 'Impossible de dissocier l\'appareil.');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      
      {/* 1. MODALE SCANNER UDP */}
      <DeviceScannerModal 
        visible={isScannerVisible}
        devices={foundDevices}
        onClose={() => { setScannerVisible(false); stopScanning(); }}
        onSelectDevice={handleSelectDevice}
      />

      {/* 2. MODALE CONFIG BLE */}
      <BleConfigModal 
        visible={isConfigModalVisible}
        onClose={() => setConfigModalVisible(false)}
        // FIX LINTER CRITIQUE : 
        // 1. On enveloppe la fonction async pour éviter l'erreur "Promise returned in void"
        // 2. On type explicitement les arguments de la callback
        onSuccess={(id: string, type: string) => {
          void handleBleSuccess(id, type);
        }}
        onReset={(id: string) => {
          void handleBleReset(id);
        }}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnConfig} onPress={() => setConfigModalVisible(true)}>
          <Text style={styles.btnConfigText}>⚙️ 1. Configurer Wi-Fi (Bluetooth)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnScan} onPress={handleOpenScanner}>
          <Text style={styles.btnScanText}>🔍 2. Associer Appareil (Déjà connecté)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Mes Appareils</Text>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.deviceId}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.icon}>{item.type === 'EMITTER' ? '👶' : '👂'}</Text>
            <View style={{flexGrow: 1}}>
              <Text style={styles.name}>{item.type === 'EMITTER' ? 'Émetteur' : 'Récepteur'}</Text>
              <Text style={styles.sub}>{item.deviceId}</Text>
            </View>
            
            <View style={[styles.badge, { backgroundColor: item.status === 'online' ? '#C6F6D5' : '#FED7D7', marginRight: 10 }]}>
              <Text style={{fontSize:12, fontWeight:'bold', color: item.status === 'online'?'green':'red'}}>
                {item.status === 'online' ? 'ON' : 'OFF'}
              </Text>
            </View>

            {/* BOUTON SUPPRIMER */}
            <TouchableOpacity 
              style={styles.btnRemove} 
              onPress={() => handleDeviceRemove(item.deviceId)}
            >
              <Text style={styles.btnRemoveText}>supprimer</Text>
            </TouchableOpacity>

          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun appareil associé.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  actions: { marginBottom: 20 },
  btnConfig: { backgroundColor: '#E9D8FD', padding: 15, borderRadius: 10, marginBottom: 10, alignItems:'center' },
  btnConfigText: { color: '#6b46c1', fontWeight: 'bold' },
  btnScan: { backgroundColor: '#EDF2F7', padding: 15, borderRadius: 10, alignItems:'center', borderStyle:'dashed', borderWidth:1, borderColor:'#CBD5E0' },
  btnScanText: { color: '#4A5568', fontWeight: 'bold' },
  
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#2D3748' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  icon: { fontSize: 24, marginRight: 15 },
  name: { fontWeight: 'bold', fontSize: 16 },
  sub: { color: 'gray', fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }, 
  empty: { textAlign: 'center', color: 'gray', marginTop: 20 },

  btnRemove: {
    marginLeft: 'auto',
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#FED7D7',
  },
  btnRemoveText: {
    fontSize: 13,
    color: '#E53E3E',
    fontWeight: 'bold',
  },
});