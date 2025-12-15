import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth } from '../../../config/firebaseConfig';
import { FamilyMembers } from '../../components/FamilyMember';
import { DeviceScannerModal } from '../../components/deviceScannerModal';
import { useFamilyManagement } from '../../hooks/useFamilyManagement';
import { useDeviceDiscovery } from '../../hooks/useDeviceDiscovery';
import { linkDeviceToMember } from '../../services/familyService';
import { stylesFamily } from '../../styles/FamilyManagementStyle';
import { DiscoveredDevice } from '../../models/device';

interface FamilyManagementProps {
  familyId: string | undefined;
}

export default function FamilyManagement({ familyId }: FamilyManagementProps) {
  // 1. Hooks existants
  const { family, loading, error } = useFamilyManagement(familyId);
  
  // 2. Nouveau Hook de découverte
  const { isScanning, foundDevices, startScanning, stopScanning } = useDeviceDiscovery();

  // 3. Logique d'interaction
  const handleAssociateDevice = async (device: DiscoveredDevice) => {
    if (!familyId || !auth.currentUser) return;

    try {
      stopScanning();
      
      await linkDeviceToMember(familyId, auth.currentUser.uid, {
        serialNumber: device.id,
        type: device.type,
      });
      
      Alert.alert('Succès', `Appareil ${device.type} associé !`);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'L\'association a échoué.');
    }
  };

  if (loading) return <View style={stylesFamily.loading}><Text>Chargement...</Text></View>;
  if (error) return <View><Text style={stylesFamily.error}>{error}</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      
      {/* --- ZONE DU BOUTON (DÉPLACÉ EN HAUT) --- */}
      <View style={localStyles.topActionContainer}>
        <Text style={localStyles.headerTitle}>Ma Famille</Text>
        <TouchableOpacity 
          style={localStyles.scanButton} 
          onPress={startScanning}
          activeOpacity={0.8}
        >
          <Text style={localStyles.scanButtonText}>📡 Ajouter un Appareil</Text>
        </TouchableOpacity>
      </View>

      {/* --- LISTE DES MEMBRES --- */}
      {/* On passe style={{flex: 1}} au conteneur de la liste si besoin dans le composant FamilyMembers */}
      <View style={{ flex: 1 }}>
        <FamilyMembers familyMembers={family ?? []} />
      </View>

      {/* --- MODALE --- */}
      <DeviceScannerModal 
        visible={isScanning}
        devices={foundDevices}
        onClose={stopScanning}
        onSelectDevice={handleAssociateDevice}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  // Conteneur du haut
  topActionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    marginBottom: 10, // Petit espace avant la liste
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  // Bouton stylisé
  scanButton: { 
    backgroundColor: '#4A90E2', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 25, 
    elevation: 3, // Ombre Android
    shadowColor: '#000', // Ombre iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16, 
  },
});