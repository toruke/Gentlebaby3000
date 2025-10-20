import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFamilyManagement } from '../hooks/useFamilyManagement';
import { styles } from '../styles/FamilyManagementStyle';

export type Device = {
  id: string;
  serialNumber: string;
  type: 'receiver' | 'transmitter';
  status: 'connected' | 'disconnected';
  pairedAt: string;
  lastSeen: string;
};
export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  device?: Device;
  avatar?: string;
};

type PropsFamilyMembers = {
  familyMembers: FamilyMember[];
};

export const FamilyMembers: React.FC<PropsFamilyMembers> = ({ familyMembers }) => {
  const { getStatusColor, getStatusText, getRoleColor } = useFamilyManagement();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Gestion de la Famille</Text>
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
            {familyMembers.reduce((count, m) => m.device ? count + 1 : count, 0)}
          </Text>
          <Text style={styles.statLabel}>Appareils</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {familyMembers.filter((m: FamilyMember) => m.device?.status === 'connected').length}
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
            </View>

            {/* Appareils du membre */}
            <View style={styles.devicesSection}>
              <Text style={styles.devicesTitle}>
                Appareil
              </Text>


              {member.device && (
                <View key={member.device.id} style={styles.deviceItem}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceIcon}>
                      {'📻 '}
                    </Text>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>Babyphone</Text>
                      <Text style={styles.deviceType}>
                        {member.device.type === 'receiver' ? 'Récepteur - ' + member.device.serialNumber : 'Emetteur - ' + member.device.serialNumber}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.deviceStatus}>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(member.device.status) },
                    ]} />
                    <View>
                      <Text style={styles.statusText}>
                        {getStatusText(member.device.status)}
                      </Text>
                      <Text style={styles.lastSeen}>
                        {member.device.lastSeen}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Actions rapides */}

            <View style={styles.actionsContainer}>
              {!member.device && (
                <TouchableOpacity key={member.id} style={styles.actionButton}>
                  <Text style={styles.actionText}>Ajouter Appareil</Text>
                </TouchableOpacity>
              )}
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
};