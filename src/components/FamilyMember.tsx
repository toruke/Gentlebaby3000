import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { getRoleColor, getStatusColor, getStatusText, getUpperName } from '../utils/familyUtils';

// --- TYPES ---
export type Device = {
  id: string;
  serialNumber: string;
  type: 'RECEIVER' | 'EMITTER';
  status: 'connected' | 'disconnected' | 'online' | 'offline';
  pairedAt: string;
  lastSeen: string;
};

export type FamilyMember = {
  idUser: string;
  idFamily: string;
  name: string;
  role: string;
  device?: Device;
  avatar?: string;
};

type PropsFamilyMembers = {
  familyMembers: FamilyMember[];
  onScanRequest: (memberId: string) => void;
};

export const FamilyMembers: React.FC<PropsFamilyMembers> = ({ familyMembers, onScanRequest }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'members' | 'devices'>('members');

  // Filtrer les membres qui ont un objet device valide
  const membersWithDevices = familyMembers.filter(m => m.device && m.device.serialNumber);

  return (
    <View style={localStyles.container}>
      
      {/* HEADER & TOGGLE */}
      <View style={localStyles.headerContainer}>
        <Text style={localStyles.pageTitle}>Gestion de la Famille</Text>
        <View style={localStyles.toggleContainer}>
          <TouchableOpacity 
            style={[localStyles.toggleButton, activeTab === 'members' && localStyles.activeToggle]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[localStyles.toggleText, activeTab === 'members' && localStyles.activeToggleText]}>
                Membres ({familyMembers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[localStyles.toggleButton, activeTab === 'devices' && localStyles.activeToggle]}
            onPress={() => setActiveTab('devices')}
          >
            <Text style={[localStyles.toggleText, activeTab === 'devices' && localStyles.activeToggleText]}>
                Appareils ({membersWithDevices.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={localStyles.scrollContent}>
        
        {/* ================= VUE MEMBRES ================= */}
        {activeTab === 'members' && (
          <View style={localStyles.section}>
            {familyMembers.map((member) => (
              <View key={member.idUser} style={localStyles.card}>
                <View style={localStyles.memberRow}>
                  <View style={localStyles.avatarContainer}>
                    <Text style={localStyles.avatarText}>
                      {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={localStyles.nameText}>{member.name}</Text>
                    <View style={[localStyles.roleBadge, { backgroundColor: getRoleColor(getUpperName(member.role)) }]}>
                      <Text style={localStyles.roleText}>{getUpperName(member.role)}</Text>
                    </View>
                  </View>
                </View>

                {/* Badge Appareil Lié */}
                {member.device && (
                  <View style={localStyles.miniDeviceBadge}>
                    <Text style={{fontSize: 12, color: '#555'}}>
                        🔗 Lié à : {member.device.type === 'RECEIVER' ? 'Récepteur' : 'Émetteur'} ({member.device.serialNumber})
                    </Text>
                  </View>
                )}

                <View style={localStyles.actionRow}>
                  {!member.device ? (
                    <TouchableOpacity 
                      style={localStyles.addButton}
                      onPress={() => onScanRequest(member.idUser)}
                    >
                      <Text style={localStyles.addButtonText}>+ Associer Appareil</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={localStyles.outlineButton}>
                      <Text style={localStyles.outlineButtonText}>Appareil connecté</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    onPress={() => router.push({
                      pathname: '/family/ModifyRole',
                      params: { 
                        idUser: member.idUser,
                        idFamily: member.idFamily,
                        name: member.name,
                        role: member.role,
                      },
                    })}
                    style={{padding: 10}}
                  >
                    <Text style={{color: 'gray'}}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={localStyles.addGlobalButton}>
              <Text style={localStyles.addGlobalText}>+ Inviter un nouveau membre</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= VUE APPAREILS ================= */}
        {activeTab === 'devices' && (
          <View style={localStyles.section}>
            {membersWithDevices.length === 0 ? (
              <View style={localStyles.emptyState}>
                <Text style={localStyles.emptyText}>Aucun appareil associé.</Text>
                <Text style={localStyles.emptySubText}>Associez un appareil depuis l'onglet Membres.</Text>
              </View>
            ) : (
              membersWithDevices.map((member) => (
                <View key={member.device!.id} style={localStyles.deviceCard}>
                  <View style={localStyles.deviceHeader}>
                    <Text style={{fontSize: 24}}>
                      {member.device!.type === 'RECEIVER' ? '👂' : '👶'}
                    </Text>
                    <View style={{marginLeft: 10, flex: 1}}>
                      <Text style={localStyles.deviceName}>
                        {member.device!.type === 'RECEIVER' ? 'Babyphone Parent' : 'Babyphone Bébé'}
                      </Text>
                      <Text style={localStyles.deviceSerial}>S/N: {member.device!.serialNumber}</Text>
                    </View>
                    <View style={[localStyles.statusBadge, { backgroundColor: getStatusColor(member.device!.status) }]}>
                      <Text style={localStyles.statusTextBadge}>{getStatusText(member.device!.status)}</Text>
                    </View>
                  </View>

                  <View style={localStyles.deviceFooter}>
                    <Text style={localStyles.deviceOwner}>Attribué à : {member.name}</Text>
                    <Text style={localStyles.lastSeen}>Vu : {member.device!.lastSeen}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

// --- STYLES LOCAUX ---
const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerContainer: { backgroundColor: '#fff', padding: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  pageTitle: { fontSize: 22, fontWeight: '700', marginBottom: 15, color: '#000' },
  
  // Toggle Tabs
  toggleContainer: { flexDirection: 'row', backgroundColor: '#EEEFF1', borderRadius: 8, padding: 4 },
  toggleButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeToggle: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 },
  toggleText: { fontWeight: '600', color: '#8E8E93' },
  activeToggleText: { color: '#000' },

  scrollContent: { padding: 15 },
  section: { gap: 15 },

  // Card Styles
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  deviceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, borderLeftWidth: 4, borderLeftColor: '#4A90E2', marginBottom: 10 },
  
  // Member Row
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarContainer: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nameText: { fontSize: 16, fontWeight: '600', color: '#000' },
  
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  roleText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  miniDeviceBadge: { backgroundColor: '#F2F2F7', padding: 6, borderRadius: 6, marginBottom: 10 },

  // Actions
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 },
  addButton: { backgroundColor: '#E8F2FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 13 },
  outlineButton: { borderColor: '#E5E5EA', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  outlineButtonText: { color: '#333', fontSize: 13 },

  // Device View Specifics
  deviceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  deviceName: { fontSize: 16, fontWeight: '600' },
  deviceSerial: { fontSize: 12, color: 'gray' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusTextBadge: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  deviceFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  deviceOwner: { fontSize: 12, color: '#555', fontStyle: 'italic' },
  lastSeen: { fontSize: 12, color: '#999' },

  // Misc
  addGlobalButton: { backgroundColor: '#fff', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  addGlobalText: { color: '#666', fontSize: 15 },
  emptyState: { alignItems: 'center', marginTop: 30 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#333' },
  emptySubText: { color: 'gray', marginTop: 5 },
});