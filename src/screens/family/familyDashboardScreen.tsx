import { useLocalSearchParams, useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../config/firebaseConfig';
import { WelcomeHeader } from '../../components/family/welcomeHeader';

// ... (Les interfaces restent inchangées) ...
export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  displayName?: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Timestamp | Date;
}

interface DashboardData {
  id?: string;
  familyName?: string;
  createdBy?: string;
  settings?: Record<string, unknown>;
  members: FamilyMember[];
  children: Child[];
}

export default function FamilyDashboardScreen() {
  const router = useRouter();
  const { id: familyId } = useLocalSearchParams();

  const [familyInfo, setFamilyInfo] = useState<Partial<DashboardData> | null>(null);
  const [membersList, setMembersList] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyLoaded, setFamilyLoaded] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);

  useEffect(() => {
    if (!familyId) return;

    // 1. Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // 2. Document Famille
    const familyRef = doc(db, 'family', familyId as string);
    const unsubscribeFamily = onSnapshot(familyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFamilyInfo({
          id: docSnap.id,
          familyName: data.name,
          createdBy: data.createdBy,
          // 🔹 CORRECTION ICI : On lit 'babies' (le champ DB) mais on le stocke dans 'children' (ton state)
          children: (data.babies || []) as Child[],
          settings: data.settings || {},
        });
      }
      setFamilyLoaded(true);
    });

    // 3. Sous-collection Members
    const membersRef = collection(db, 'family', familyId as string, 'members');
    const unsubscribeMembers = onSnapshot(membersRef, (querySnapshot) => {
      const members: FamilyMember[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const names = (data.displayName || 'Utilisateur Inconnu').split(' ');

        return {
          id: doc.id,
          firstName: data.firstName || names[0],
          lastName: data.lastName || (names.length > 1 ? names.slice(1).join(' ') : ''),
          role: data.role || 'unknown',
          displayName: data.displayName,
        };
      });

      setMembersList(members);
      setMembersLoaded(true);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFamily();
      unsubscribeMembers();
    };
  }, [familyId]);

  useEffect(() => {
    if (familyLoaded && membersLoaded) {
      setLoading(false);
    }
  }, [familyLoaded, membersLoaded]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement de la famille...</Text>
      </View>
    );
  }

  if (!familyInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Famille non trouvée</Text>
      </View>
    );
  }

  // 4. Fusion des données
  const familyData: DashboardData = {
    members: membersList,
    children: familyInfo.children || [], // Ici, familyInfo.children contient maintenant les données de 'babies'
    familyName: familyInfo.familyName,
    id: familyInfo.id,
    createdBy: familyInfo.createdBy,
    settings: familyInfo.settings,
  };

  const findCurrentUserInFamily = (): FamilyMember | undefined => {
    if (!currentUser || !membersList) return undefined;
    return membersList.find(member => member.id === currentUser.uid);
  };

  const userInFamily = findCurrentUserInFamily();
  const userName = userInFamily?.firstName || currentUser?.displayName || 'Utilisateur';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <WelcomeHeader
          userName={userName}
          familyName={familyData.familyName || 'Ma Famille'}
        />




        {/* STATS */}
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
                {familyData.members.filter((m) =>
                  ['TUTOR', 'tuteur', 'Tuteur principal'].includes(m.role),
                ).length}
              </Text>
              <Text style={styles.statLabel}>Tuteurs</Text>
            </View>
          </View>
        </View>

        {/* SECTIONS LISTES */}
        <View style={styles.sections}>

          {/* Section Membres */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Membres de la famille</Text>
            <TouchableOpacity
              style={styles.addUserBtn}
              onPress={() => router.push('./')}
            >
              <Text style={styles.addUser}>+ inviter</Text>
            </TouchableOpacity>
            {familyData.members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View>
                  <Text style={styles.memberName}>
                    {member.firstName} {member.lastName}
                  </Text>
                  <Text style={styles.memberRole}>
                    {getRoleLabel(member.role)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Section Enfants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👶 Enfants</Text>
            {familyData.children.length === 0 ? (
              <Text style={styles.emptyText}>Aucun enfant ajouté.</Text>
            ) : (
              familyData.children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childItem}
                  onPress={() => router.push(`/family/${familyId}/child/${child.id}`)}
                >
                  <Text style={styles.childName}>
                    {child.firstName} {child.lastName}
                  </Text>
                  <Text style={styles.childAge}>
                    {calculateAge(child.birthDate)} ans
                  </Text>
                </TouchableOpacity>
              ))


            )}

            <TouchableOpacity
              style={styles.addChildBtn}
              onPress={() => router.push(`/family/${familyId}/child`)}
            >
              <Text style={styles.addChildText}>+ Ajouter un enfant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView >
  );
}

// Helpers restent inchangés
const getRoleLabel = (role: string): string => {
  switch (role) {
  case 'tuteur':
  case 'Tuteur principal':
  case 'admin':
    return '👑 Tuteur';
  case 'tuteur secondaire':
    return '👑 Tuteur secondaire';
  case 'membre':
    return '👤 Aide';
  case 'enfant':
    return '👶 Enfant';
  default:
    return '❓ Inconnu';
  }
};

const calculateAge = (birthDate: Timestamp | Date | undefined): number => {
  if (!birthDate) return 0;
  const birth = (birthDate as Timestamp).toDate
    ? (birthDate as Timestamp).toDate()
    : (birthDate as Date);

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 12, color: '#64748b' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 },
  errorText: { fontSize: 18, color: '#ef4444', marginBottom: 20 },
  stats: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  statsTitle: { fontSize: 16, fontWeight: '600', color: '#2d3748', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#6b46c1' },
  statLabel: { fontSize: 12, color: '#718096', marginTop: 4 },
  sections: { gap: 16 },
  section: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2d3748', marginBottom: 12 },
  memberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  memberName: { fontSize: 14, color: '#374151', fontWeight: '500' },
  memberRole: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  childItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  childName: { fontSize: 14, color: '#374151' },
  childAge: { fontSize: 12, color: '#6b7280' },
  addChildBtn: { marginTop: 12, backgroundColor: '#8E59FF', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  addUserBtn: { marginBottom: 12, backgroundColor: '#8E59FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', alignSelf: 'flex-start' },
  addUser: { color: 'white', fontWeight: '600', fontSize: 15, textAlign: 'center' },
  addChildText: { color: 'white', fontWeight: '600', fontSize: 15 },
  emptyText: { color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  settingBtn: { position: 'absolute', top: -63, right: 5 },
  setting: {},
});