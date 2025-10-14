import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { WelcomeHeader } from '../../../../src/components/family/welcomeHeader';
import { ActivityCard } from '../../../../src/components/family/activityCard';
import { getMockFamilyData, getMockUpcomingActivity } from '../../../../src/services/mockData';

export default function FamilyDashboard() {
  const familyData = getMockFamilyData();
  const upcomingActivity = getMockUpcomingActivity();
  const currentUser = familyData.members[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <WelcomeHeader 
          userName={currentUser.firstName} 
          familyName={familyData.familyName} 
        />

        {upcomingActivity && (
          <ActivityCard 
            activity={upcomingActivity}
            // eslint-disable-next-line no-console
            onMarkAsDone={() => console.log('Activité marquée comme faite')}
          />
        )}

        {/* Actions rapides - PLUS BESOIN DES BOUTONS DE NAVIGATION */}
        <View style={styles.actions}>
          <Link href="../settings" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>⚙️ Paramètres du compte</Text>
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>👥 Inviter un membre</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION STATISTIQUES RAPIDES */}
        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Aperçu de la famille</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{familyData.members.length}</Text>
              <Text style={styles.statLabel}>Membres</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{familyData.children.length}</Text>
              <Text style={styles.statLabel}>Enfants</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {familyData.members.filter(m => m.role === 'TUTOR').length}
              </Text>
              <Text style={styles.statLabel}>Tuteurs</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
  stats: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
});