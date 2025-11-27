import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../../../config/firebaseConfig';
import { WelcomeHeader } from '../../components/family/welcomeHeader';
import { Family } from '../../models/family';

export default function FamilyDashboardScreen() {
  const { id: familyId } = useLocalSearchParams();
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;

    // 1. Écouter l'authentification utilisateur
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // 2. Écouter les changements de la famille
    const familyRef = doc(db, 'families', familyId as string);
    const unsubscribeFamily = onSnapshot(familyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFamilyData({
          id: docSnap.id,
          familyName: data.name,
          createdBy: data.createdBy,
          members: data.members || [],
          children: data.children || [],
          settings: data.settings || {},
        });
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFamily();
    };
  }, [familyId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement de la famille...</Text>
      </View>
    );
  }

  if (!familyData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Famille non trouvée</Text>
      </View>
    );
  }

  // Trouver l'utilisateur actuel dans les membres de la famille
  const findCurrentUserInFamily = () => {
    if (!currentUser || !familyData.members) return null;
    
    return familyData.members.find(member => 
      member.id === currentUser.uid,
    );
  };

  const userInFamily = findCurrentUserInFamily();
  const userName = userInFamily?.firstName || currentUser?.displayName || 'Utilisateur';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* HEADER DE BIENVENUE */}
        <WelcomeHeader 
          userName={userName} 
          familyName={familyData.familyName} 
        />

        {/* SECTION STATISTIQUES */}
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

        {/* CONTENU ADDITIONNEL */}
        <View style={styles.sections}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Membres de la famille</Text>
            {familyData.members.map(member => (
              <View key={member.id} style={styles.memberItem}>
                <Text style={styles.memberName}>
                  {member.firstName} {member.lastName}
                </Text>
                <Text style={styles.memberRole}>
                  {member.role === 'TUTOR' ? '👑 Tuteur' : 
                    member.role === 'HELPER' ? '👤 Aide' : '👀 Observateur'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👶 Enfants</Text>
            {familyData.children.map(child => (
              <View key={child.id} style={styles.childItem}>
                <Text style={styles.childName}>
                  {child.firstName} {child.lastName}
                </Text>
                <Text style={styles.childAge}>
                  {calculateAge(child.birthDate)} ans
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// Helper pour calculer l'âge
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  stats: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  sections: {
    gap: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  memberName: {
    fontSize: 14,
    color: '#374151',
  },
  memberRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  childName: {
    fontSize: 14,
    color: '#374151',
  },
  childAge: {
    fontSize: 12,
    color: '#6b7280',
  },
});