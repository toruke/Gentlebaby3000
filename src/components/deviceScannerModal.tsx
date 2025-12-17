import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DiscoveredDevice } from '../models/device';

interface DeviceScannerModalProps {
  visible: boolean;
  devices: DiscoveredDevice[];
  onClose: () => void;
  onSelectDevice: (device: DiscoveredDevice) => void;
}

export const DeviceScannerModal: React.FC<DeviceScannerModalProps> = ({
  visible,
  devices,
  onClose,
  onSelectDevice,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recherche d'appareils...</Text>
          <Text style={styles.subText}>Assurez-vous que le babyphone est branché et non associé.</Text>

          {devices.length === 0 && (
            <ActivityIndicator size="large" color="#4A90E2" style={{ margin: 20 }} />
          )}

          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            style={{ width: '100%' }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceItem}
                onPress={() => onSelectDevice(item)}
              >
                <View>
                  <Text style={styles.deviceType}>
                    {item.type === 'EMITTER' ? '👶 Émetteur (Bébé)' : '👂 Récepteur (Parent)'}
                  </Text>
                  <Text style={styles.deviceMac}>ID: {item.id}</Text>
                </View>
                <Text style={styles.associateText}>Associer</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', fontStyle: 'italic', marginTop: 10 }}>Recherche en cours...</Text>
            }
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20, maxHeight: '70%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subText: { fontSize: 14, color: 'gray', marginBottom: 20, textAlign: 'center' },
  deviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', width: '100%' },
  deviceType: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  deviceMac: { fontSize: 12, color: '#666' },
  associateText: { color: '#4A90E2', fontWeight: 'bold' },
  closeButton: { marginTop: 20, padding: 10 },
  closeButtonText: { color: 'red', fontSize: 16 },
});