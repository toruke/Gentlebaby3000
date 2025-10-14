import { Text, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';

// Types pour les données
type FamilyMember = {
    id: string;
    name: string;
    role: string;
    devices: Device[];
    avatar?: string;
};

type Device = {
    id: string;
    name: string;
    type: 'phone' | 'tablet' | 'watch' | 'other';
    status: 'connected' | 'disconnected' | 'low-battery';
    lastSeen: string;
};

export default function FamilyManagement() {
  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Maggie Parent',
      role: 'Tuteur',
      devices: [
        {
          id: '1-1',
          name: 'iPhone 13',
          type: 'phone',
          status: 'connected',
          lastSeen: 'Maintenant',
        },
        {
          id: '1-2',
          name: 'iPad Air',
          type: 'tablet',
          status: 'connected',
          lastSeen: 'Il y a 5 min',
        },
      ],
    },
    {
      id: '2',
      name: 'Lucas',
      role: 'Enfant',
      devices: [
        {
          id: '2-1',
          name: 'Baby Monitor',
          type: 'other',
          status: 'connected',
          lastSeen: 'Maintenant',
        },
      ],
    },
    {
      id: '3',
      name: 'Emma',
      role: 'Enfant',
      devices: [
        {
          id: '3-1',
          name: 'Baby Monitor',
          type: 'watch',
          status: 'connected',
          lastSeen: 'Maintenant',
        },
      ],
    },
    {
      id: '4',
      name: 'Grand-mère',
      role: 'Membre',
      devices: [
        {
          id: '4-1',
          name: 'Android Phone',
          type: 'phone',
          status: 'disconnected',
          lastSeen: 'Hier, 14:30',
        },
      ],
    },
  ]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
    case 'phone': return '📱';
    case 'tablet': return '📟';
    case 'watch': return '⌚';
    default: return '📻';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'connected': return '#48bb78';
    case 'disconnected': return '#e53e3e';
    case 'low-battery': return '#ed8936';
    default: return '#a0aec0';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
    case 'connected': return 'Connecté';
    case 'disconnected': return 'Déconnecté';
    case 'low-battery': return 'Batterie faible';
    default: return 'Inconnu';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
    case 'Tuteur': return '#6b46c1';
    case 'Enfant': return '#4299e1';
    case 'Membre': return '#38a169';
    default: return '#718096';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Gestion Familiale</Text>
        <Text style={styles.subtitle}>Membres et appareils connectés</Text>
      </View>

      {/* Statistiques rapides */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{familyMembers.length}</Text>
          <Text style={styles.statLabel}>Membres</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {familyMembers.reduce((total, member) => total + member.devices.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Appareils</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {familyMembers.flatMap(m => m.devices).filter(d => d.status === 'connected').length}
          </Text>
          <Text style={styles.statLabel}>En ligne</Text>
        </View>
      </View>

      {/* Liste des membres de la famille */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membres de la Famille</Text>
                
        {familyMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            {/* En-tête du membre */}
            <View style={styles.memberHeader}>
              <View style={styles.memberInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) }]}>
                    <Text style={styles.roleText}>{member.role}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuIcon}>⋯</Text>
              </TouchableOpacity>
            </View>

            {/* Appareils du membre */}
            <View style={styles.devicesSection}>
              <Text style={styles.devicesTitle}>
                                Appareils ({member.devices.length})
              </Text>
                            
              {member.devices.map((device) => (
                <View key={device.id} style={styles.deviceItem}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceIcon}>
                      {getDeviceIcon(device.type)}
                    </Text>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceType}>
                        {device.type === 'phone' ? 'Téléphone' : 
                          device.type === 'tablet' ? 'Tablette' :
                            device.type === 'watch' ? 'Montre' : 'Autre'}
                      </Text>
                    </View>
                  </View>
                                    
                  <View style={styles.deviceStatus}>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(device.status) },
                    ]} />
                    <View>
                      <Text style={styles.statusText}>
                        {getStatusText(device.status)}
                      </Text>
                      <Text style={styles.lastSeen}>
                        {device.lastSeen}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Actions rapides */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Ajouter Appareil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Bouton d'ajout de membre */}
      <TouchableOpacity style={styles.addMemberButton}>
        <Text style={styles.addMemberText}>+ Ajouter un Membre</Text>
      </TouchableOpacity>

      {/* Lien retour */}
      <Link href="/" style={styles.backLink}>
        <Text style={styles.backText}>Retour à l'accueil</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6b46c1',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -30,
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b46c1',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6b46c1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#718096',
    fontWeight: 'bold',
  },
  devicesSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  devicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
  deviceType: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2d3748',
  },
  lastSeen: {
    fontSize: 10,
    color: '#a0aec0',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  actionText: {
    color: '#6b46c1',
    fontSize: 14,
    fontWeight: '500',
  },
  addMemberButton: {
    backgroundColor: '#6b46c1',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addMemberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  backText: {
    color: '#6b46c1',
    fontSize: 16,
    fontWeight: '500',
  },
});