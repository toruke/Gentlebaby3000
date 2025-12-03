import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../config/firebaseConfig';

interface Family {
  id: string;
  name: string;
  photoUrl?: string;
  createdBy: string;
  memberIds: string[];
}

export default function HomeScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true); // 🔹 Ajout d'un état de chargement
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 🔹 C'est ICI que se trouve la correction importante :
        // On cherche dans 'memberIds' (le tableau de strings) et non plus 'members'
        const familiesQuery = query(
          collection(db, 'family'),
          where('memberIds', 'array-contains', currentUser.uid),
        );

        const unsubscribeFamilies = onSnapshot(familiesQuery, (snapshot) => {
          const familiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Family[];
          
          setFamilies(familiesData);
          setLoading(false); // Fin du chargement
        }, (error) => {
          console.error('Erreur récup familles:', error);
          setLoading(false);
        });

        return () => unsubscribeFamilies();
      } else {
        setFamilies([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const handleFamilyPress = (familyId: string) => {
    router.push(`/family/${familyId}/(tabs)/dashboard`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Familles</Text>

        <View style={styles.headerActions}>
          {user ? (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste des familles */}
      <View style={styles.familiesContainer}>
        {loading ? (
          // 🔹 Indicateur de chargement
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : families.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucune famille</Text>
            <Text style={styles.emptyStateText}>
              {user ? 'Créez votre première famille pour commencer' : 'Connectez-vous pour voir vos familles'}
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {families.map((family) => (
              <TouchableOpacity
                key={family.id}
                style={styles.familyCard}
                onPress={() => handleFamilyPress(family.id)}
              >
                <View style={styles.familyImage}>
                  {family.photoUrl ? (
                    <Image
                      source={{ uri: family.photoUrl }}
                      style={styles.familyPhoto}
                    />
                  ) : (
                    <Text style={styles.familyEmoji}>🏠</Text>
                  )}
                </View>
                <Text style={styles.familyName} numberOfLines={1}>
                  {family.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
  },
  logoutButtonText: {
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  familiesContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  scrollContent: {
    paddingHorizontal: 20, // Padding pour le début et fin du scroll horizontal
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  familyCard: {
    width: 150,
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginRight: 16, // Espace entre les cartes
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  familyImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  familyPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  familyEmoji: {
    fontSize: 32,
  },
  familyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
});