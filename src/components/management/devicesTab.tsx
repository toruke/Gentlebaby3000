import React, { useState } from 'react';
import { 
  FlatList, StyleSheet, Text, TouchableOpacity, View, Alert, 
  Modal, TextInput, // Ajout de Modal et TextInput
} from 'react-native';

import { DeviceScannerModal } from '@/src/components/deviceScannerModal';
import { BleConfigModal } from '@/src/components/bleConfigModal';
import { useDeviceDiscovery } from '@/src/hooks/useDeviceDiscovery'; 
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
  // États pour les Modales existantes
  const [isScannerVisible, setScannerVisible] = useState<boolean>(false);
  const [isConfigModalVisible, setConfigModalVisible] = useState<boolean>(false);

  // NOUVEAUX ÉTATS POUR LA SESSION
  const [isSessionModalVisible, setSessionModalVisible] = useState<boolean>(false);
  const [inputServerIp, setInputServerIp] = useState<string>('192.168.129.45'); // Valeur par défaut (ton PC)
  const [inputReceiverIp, setInputReceiverIp] = useState<string>(''); // À remplir

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
  const handleBleSuccess = async (deviceId: string, type: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
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
        { text: 'Annuler', style: 'cancel' },
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

  // --- LOGIQUE SESSION ---
  const createSession = async () => {
    if (!inputServerIp || !inputReceiverIp) {
      Alert.alert('Erreur', 'Veuillez remplir les deux adresses IP.');
      return;
    }

    // Fermer la modale
    setSessionModalVisible(false);

    try {
      const response = await fetch(`http://${inputServerIp}:8080/create_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverIp: inputReceiverIp,
        }),
      });
    
      const json = await response.json();
      console.log('Session créée:', json);
      Alert.alert('Session Active', `Le babyphone écoute et enverra vers ${inputReceiverIp} !`);
    
    } catch (error) {
      console.error('Erreur connexion serveur:', error);
      Alert.alert('Erreur', 'Impossible de joindre le serveur PC (' + inputServerIp + ')');
    }
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
        onSuccess={(id: string, type: string) => { void handleBleSuccess(id, type); }}
        onReset={(id: string) => { void handleBleReset(id); }}
      />

      {/* 3. MODALE SESSION (Nouvelle) */}
      <Modal
        visible={isSessionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSessionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Démarrer une Session</Text>
                
            <Text style={styles.label}>IP du Serveur (PC) :</Text>
            <TextInput 
              style={styles.input}
              value={inputServerIp}
              onChangeText={setInputServerIp}
              placeholder="Ex: 192.168.1.10"
              keyboardType="numeric"
            />

            <Text style={styles.label}>IP du Récepteur (Babyphone) :</Text>
            <TextInput 
              style={styles.input}
              value={inputReceiverIp}
              onChangeText={setInputReceiverIp}
              placeholder="Ex: 192.168.1.50"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setSessionModalVisible(false)}>
                <Text style={{color: 'gray'}}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnConfirm} onPress={createSession}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnConfig} onPress={() => setConfigModalVisible(true)}>
          <Text style={styles.btnConfigText}>⚙️ 1. Configurer Wi-Fi (Bluetooth)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnScan} onPress={handleOpenScanner}>
          <Text style={styles.btnScanText}>🔍 2. Associer Appareil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnSess} 
          onPress={() => setSessionModalVisible(true)}
        >
          <Text style={styles.btnSessText}>📡 3. Démarrer une session</Text>
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

            <TouchableOpacity 
              style={styles.btnRemove} 
              onPress={() => handleDeviceRemove(item.deviceId)}
            >
              <Text style={styles.btnRemoveText}>🗑️</Text>
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
  
  btnSess: { backgroundColor: '#C6F6D5', padding: 15, borderRadius: 10, alignItems:'center', marginTop:10 },
  btnSessText: { color: 'green', fontWeight: 'bold', fontSize: 16 },
  
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#2D3748' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  icon: { fontSize: 24, marginRight: 15 },
  name: { fontWeight: 'bold', fontSize: 16 },
  sub: { color: 'gray', fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }, 
  empty: { textAlign: 'center', color: 'gray', marginTop: 20 },

  btnRemove: {
    marginLeft: 'auto',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FED7D7',
  },
  btnRemoveText: {
    fontSize: 14,
    color: '#E53E3E',
    fontWeight: 'bold',
  },

  // STYLES POUR LA NOUVELLE MODALE SESSION
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2D3748',
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#4A5568',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F7FAFC',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  btnCancel: {
    padding: 10,
    marginRight: 15,
  },
  btnConfirm: {
    backgroundColor: '#6b46c1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});