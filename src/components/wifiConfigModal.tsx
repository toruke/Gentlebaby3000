import React, { useState } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, FlatList, 
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

interface WifiConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WifiConfigModal = ({ visible, onClose }: WifiConfigModalProps) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Connect AP, 2: Scan List, 3: Password input
  
  const [networks, setNetworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Fonction générique pour parler à la Pico
  const sendCommandToPico = (command: string, callback: (response: string) => void) => {
    const options = { port: 80, host: '192.168.4.1' };
    
    // Timeout de sécurité (10s)
    const timer = setTimeout(() => {
      setLoading(false);
      Alert.alert('Délai dépassé', 'Impossible de joindre la Pico. Êtes-vous connecté à son Wi-Fi ?');
    }, 10000);

    // 🟢 CORRECTION 1 : Typage strict du socket au lieu de 'any'
    let client: TcpSocket.Socket | null = null;

    try {
      client = TcpSocket.createConnection(options, () => {
        // Ajout du \n vital pour la Pico (readStringUntil)
        client?.write(command + '\n'); // Utilisation de l'optional chaining par sécurité
      });
    } catch (e) {
      clearTimeout(timer);
      setLoading(false);
      Alert.alert('Erreur critique', 'Le module TCP n\'est pas chargé. Avez-vous fait \'npx expo run:android\' ?');
      return;
    }

    let buffer = '';

    client.on('data', (data: string | Buffer) => {
      buffer += data.toString();
      
      // LOGIQUE DE FIN DE MESSAGE
      if (command === 'SCAN') {
        // Pour le scan, on attend la fin de la liste
        if (buffer.includes('ENDLIST') || buffer.includes('NONE')) {
          clearTimeout(timer);
          client?.destroy(); // On ferme la connexion
          callback(buffer);
        }
      } else {
        // Pour la config (OK), on attend juste une réponse courte
        if (buffer.includes('OK')) {
          clearTimeout(timer);
          client?.destroy();
          callback(buffer);
        }
      }
    });

    // 🟢 CORRECTION 2 : Typage de l'erreur standard JS
    client.on('error', (err: Error) => {
      clearTimeout(timer);
      console.log('TCP Error:', err);
      setLoading(false);
      Alert.alert('Erreur', 'Echec de connexion TCP. Vérifiez le Wi-Fi et coupez la 4G.');
    });
  };

  // Étape 2 : Lancer le Scan
  const scanNetworks = () => {
    console.log('1. Début fonction scanNetworks'); 
    setLoading(true);
    setLoadingText('Demande de scan TCP...');
    
    sendCommandToPico('SCAN', (response) => {
      console.log('4. Réponse reçue de la Pico :', response); 
      setLoading(false);
      
      if (response.includes('NONE')) {
        Alert.alert('Info', 'Aucun réseau trouvé.');
        setNetworks([]);
      } else {
        const cleanList = response
          .replace('ENDLIST', '')
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0);
          
        const uniqueList = Array.from(new Set(cleanList));
        console.log('5. Liste parsée :', uniqueList); 
        setNetworks(uniqueList);
        setStep(2);
      }
    });
  };

  // Étape 3 : Envoyer la config
  const sendConfiguration = () => {
    if (!password) {
      Alert.alert('Erreur', 'Mot de passe requis');
      return;
    }

    setLoading(true);
    setLoadingText('Envoi de la configuration...');
    
    const payload = `${ssid}|${password}`;
    
    sendCommandToPico(payload, (response) => {
      setLoading(false);
      if (response.includes('OK')) {
        Alert.alert('Succès', 'Configuration enregistrée ! La Pico va redémarrer.');
        onClose();
        // Reset des states
        setStep(1);
        setSsid('');
        setPassword('');
        setNetworks([]);
      } else {
        Alert.alert('Erreur', 'Réponse inconnue de la Pico.');
      }
    });
  };

  const selectNetwork = (networkName: string) => {
    setSsid(networkName.trim());
    setStep(3);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Configuration Wi-Fi (TCP)</Text>

          {/* ÉTAPE 1 : INSTRUCTION */}
          {step === 1 && (
            <View>
              <Text style={styles.instruction}>
                1. <Text style={{fontWeight:'bold', color:'red'}}>COUPEZ LA 4G</Text>{'\n'}
                2. Connectez ce téléphone au Wi-Fi :{'\n'}
                <Text style={{fontWeight: 'bold', color: '#6b46c1'}}>Baby_Config_...</Text>{'\n\n'}
                3. Une fois connecté, appuyez ci-dessous.
              </Text>
              
              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="#6b46c1" />
                  <Text style={{marginTop: 10}}>{loadingText}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.btn} onPress={scanNetworks}>
                  <Text style={styles.btnText}>Lancer le scan TCP</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ÉTAPE 2 : LISTE DES RÉSEAUX */}
          {step === 2 && (
            <View style={{maxHeight: 400}}>
              <Text style={styles.subTitle}>Choisissez votre réseau :</Text>
              
              <FlatList 
                data={networks}
                keyExtractor={(item, index) => index.toString()}
                style={{marginBottom: 15}}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.networkItem} onPress={() => selectNetwork(item)}>
                    <Text style={styles.networkText}>📡 {item}</Text>
                    <Text style={styles.chevron}>{'>'}</Text>
                  </TouchableOpacity>
                )}
              />
              
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(1)}>
                <Text style={styles.cancelText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ÉTAPE 3 : MOT DE PASSE */}
          {step === 3 && (
            <View>
              <Text style={styles.label}>Réseau sélectionné :</Text>
              <Text style={styles.ssidDisplay}>{ssid}</Text>

              <Text style={styles.label}>Mot de passe Wi-Fi</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Entrez le mot de passe" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry
                autoCapitalize="none"
              />

              {loading ? (
                <ActivityIndicator size="large" color="#6b46c1" />
              ) : (
                <TouchableOpacity style={styles.btn} onPress={sendConfiguration}>
                  <Text style={styles.btnText}>Connecter la Pico</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(2)}>
                <Text style={styles.cancelText}>Changer de réseau</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#2d3748' },
  subTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#4A5568' },
  instruction: { fontSize: 16, color: '#4a5568', lineHeight: 24, marginBottom: 20 },
  
  loadingBox: { alignItems: 'center', padding: 20 },
  
  // Liste réseaux
  networkItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  networkText: { fontSize: 16, color: '#2D3748' },
  chevron: { fontSize: 18, color: '#CBD5E0', fontWeight: 'bold' },

  // Formulaire
  label: { fontSize: 14, fontWeight: '600', color: '#718096', marginBottom: 5, marginTop: 10 },
  ssidDisplay: { fontSize: 18, fontWeight: 'bold', color: '#6b46c1', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
  
  btn: { backgroundColor: '#6b46c1', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { marginTop: 15, alignItems: 'center', padding: 10 },
  cancelText: { color: '#718096' },
});