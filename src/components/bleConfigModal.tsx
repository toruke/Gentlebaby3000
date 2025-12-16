import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, PermissionsAndroid, Platform, FlatList,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { encode, decode } from 'base-64';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CONFIG_UUID  = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const SCAN_UUID    = '86d38e23-747e-461b-94c6-4e5f726715d2';

interface BleConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BleConfigModal = ({ visible, onClose }: BleConfigModalProps) => {
  // Données
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  
  // États UI
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  
  // 🟢 CORRECTION 1 : On remet la variable d'état manquante
  const [status, setStatus] = useState('');

  // État pour gérer l'affichage du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const [devicesList, setDevicesList] = useState<Device[]>([]);
  const [wifiList, setWifiList] = useState<string[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  
  const manager = useMemo(() => new BleManager(), []);

  // Nettoyage quand on ferme la modale
  const cleanup = useCallback(() => {
    manager.stopDeviceScan();
    if (connectedDevice) connectedDevice.cancelConnection().catch(() => {});
    setConnectedDevice(null);
    setLoading(false);
    setStatus(''); // Reset status
    setStep(0); 
    setSsid('');
    setPassword('');
    setDevicesList([]);
    setWifiList([]);
    setShowPassword(false);
  }, [manager, connectedDevice]);

  useEffect(() => {
    if (!visible) cleanup();
  }, [visible, cleanup]);

  // --- 1. SCAN (ON REMPLIT LA LISTE SEULEMENT) ---
  const startScan = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      if (granted['android.permission.BLUETOOTH_SCAN'] !== 'granted') return;
    }

    setLoading(true);
    setStatus('Recherche des appareils...'); // On informe l'utilisateur
    setDevicesList([]); 

    // Scan large (null)
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        setLoading(false);
        return;
      }

      if (device && device.name) {
        const n = device.name;
        // On accepte tout ce qui ressemble à nos cartes
        if (n.includes('BTstack') || n.includes('Shield') || n.includes('Pico') || n.includes('Baby')) {
          setDevicesList(prev => {
            if (!prev.find(d => d.id === device.id)) {
              return [...prev, device];
            }
            return prev;
          });
        }
      }
    });

    // On arrête le scan après 5 secondes
    setTimeout(() => {
      manager.stopDeviceScan();
      setLoading(false);
      setStatus('');
    }, 5000);
  };

  // --- 2. CONNEXION AU DEVICE CHOISI ---
  const handleSelectDevice = async (device: Device) => {
    manager.stopDeviceScan();
    
    setLoading(true);
    setStatus(`Connexion à ${device.name || 'l\'appareil'}...`); // Utilisation de status
    console.log(`[BLE] Tentative de connexion à : ${device.id}`);

    try {
      const connected = await device.connect({ autoConnect: false, requestMTU: 23 });
      console.log('[BLE] Connecté !');
      
      setStatus('Découverte des services...');
      console.log('[BLE] Découverte services/char...');
      await connected.discoverAllServicesAndCharacteristics();
      
      setConnectedDevice(connected);

      setStatus('Récupération des Wi-Fi...');
      console.log(`[BLE] Lecture caractéristique UUID: ${SCAN_UUID}`);
      
      const characteristic = await connected.readCharacteristicForService(
        SERVICE_UUID, 
        SCAN_UUID,
      );
      
      if (characteristic.value) {
        console.log(`[BLE] Données reçues (Base64): ${characteristic.value}`);
        const decoded = decode(characteristic.value);
        console.log(`[BLE] Données décodées: ${decoded}`);
        
        const networks = decoded.split('|').filter(n => n.length > 0);
        const uniqueList = [...new Set(networks)];
        
        setWifiList(uniqueList);
        setStep(2); 
      } else {
        throw new Error('Aucune donnée reçue du Babyphone.');
      }

    } catch (err) {
      const error = err as Error;
      console.error('[BLE] ERREUR CRITIQUE:', error);
      
      Alert.alert(
        'Échec Connexion', 
        `Erreur: ${error.message}\n\nAssurez-vous que le Babyphone n'est pas déjà connecté.`,
      );
      
      setLoading(false);
    } finally {
      // On ne met pas setLoading(false) ici si succès, car on change de step
      if(step === 0) setLoading(false);
    }
  };

  const selectWifi = (name: string) => {
    setSsid(name);
    setStep(3); 
  };

  const sendConfig = async () => {
    if (!password || !connectedDevice) return;
    setLoading(true);
    setStatus('Envoi de la configuration...');
    try {
      const rawData = `${ssid}|${password}\n`; 
      const base64Data = encode(rawData);

      await connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID, CONFIG_UUID, base64Data,
      );

      Alert.alert('Succès', 'Configuration envoyée !');
      onClose();
    } catch (error) {
      const err = error as Error;
      Alert.alert('Erreur', err.message);
    } finally {
      cleanup();
    }
  };

  // --- ELEMENTS GRAPHIQUES ---

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectDevice(item)}>
      <Text style={styles.cardTitle}>👶 {item.name || 'Appareil Inconnu'}</Text>
      <Text style={styles.cardSub}>ID: {item.id}</Text>
      <Text style={{color:'#6b46c1', marginTop:5}}>Toucher pour configurer</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Configuration Babyphone</Text>

          {/* ETAPE 0 : LISTE DES APPAREILS */}
          {step === 0 && (
            <View style={{height: 400}}>
              <Text style={styles.subTitle}>1. Sélectionnez l'appareil :</Text>
              
              {/* 🟢 CORRECTION 2 : Affichage du statut de chargement */}
              {loading && (
                <View style={{alignItems:'center', marginBottom:10}}>
                  <ActivityIndicator color="#6b46c1" />
                  <Text style={{color:'#666', fontSize:12, marginTop:5}}>{status}</Text>
                </View>
              )}
              
              <FlatList
                data={devicesList}
                keyExtractor={item => item.id}
                renderItem={renderDeviceItem}
                ListEmptyComponent={
                  !loading ? <Text style={styles.emptyText}>Aucun appareil trouvé. Relancez le scan.</Text> : null
                }
              />
              
              <View style={styles.rowBtn}>
                <TouchableOpacity style={[styles.btn, {backgroundColor: '#EDF2F7', marginRight: 10}]} onPress={startScan}>
                  <Text style={[styles.btnText, {color: '#2d3748'}]}>{loading ? 'Scan...' : 'Lancer Scan'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, {backgroundColor: '#e53e3e'}]} onPress={onClose}>
                  <Text style={styles.btnText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ETAPE 2 : LISTE WIFI */}
          {step === 2 && (
            <View style={{maxHeight: 400}}>
              <Text style={styles.subTitle}>2. Choisissez le réseau Wi-Fi :</Text>
              <FlatList 
                data={wifiList}
                keyExtractor={(i) => i}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.wifiItem} onPress={() => selectWifi(item)}>
                    <Text style={styles.wifiText}>📡 {item}</Text>
                    <Text style={styles.chevron}>{'>'}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.cancelBtn} onPress={cleanup}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ETAPE 3 : MOT DE PASSE */}
          {step === 3 && (
            <View>
              <Text style={styles.label}>Réseau : <Text style={{color:'#6b46c1', fontWeight:'bold'}}>{ssid}</Text></Text>
              
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.passwordInput} 
                  placeholder="Mot de passe" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!showPassword} 
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeButton} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{fontSize: 22}}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={{alignItems:'center'}}>
                  <ActivityIndicator size="large" color="#6b46c1" />
                  <Text style={{marginTop:10, color:'#666'}}>{status}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.mainBtn} onPress={sendConfig}>
                  <Text style={styles.btnText}>Envoyer la configuration</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(2)}>
                <Text style={styles.cancelText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25, maxHeight: '80%' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2d3748' },
  subTitle: { fontSize: 16, marginBottom: 10, fontWeight: '600', color: '#4A5568'},
  
  card: { backgroundColor: '#F7FAFC', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth:1, borderColor: '#EDF2F7' },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#2d3748' },
  cardSub: { color: '#718096', fontSize: 12 },
  
  wifiItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  wifiText: { fontSize: 16, color: '#2D3748' },
  chevron: { fontSize: 18, color: '#ccc', fontWeight: 'bold'},

  label: { fontSize: 14, fontWeight: '600', color: '#718096', marginBottom: 10 },
  
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 10, 
    marginBottom: 20, 
  },
  passwordInput: { 
    flex: 1, 
    padding: 12, 
    fontSize: 16,
    color: '#000',
  },
  eyeButton: { padding: 12 },

  btn: { padding: 12, borderRadius: 8, alignItems: 'center', flex: 1 },
  mainBtn: { backgroundColor: '#6b46c1', padding: 15, borderRadius: 12, alignItems: 'center', width: '100%' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  rowBtn: { flexDirection: 'row', marginTop: 10 },
  
  cancelBtn: { marginTop: 15, alignItems: 'center', padding: 10 },
  cancelText: { color: '#718096' },
  emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 20, fontStyle: 'italic' },
});