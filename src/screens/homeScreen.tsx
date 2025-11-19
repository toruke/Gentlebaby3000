import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';

interface Family {
  id: string;
  name: string;
  photoUrl?: string;
  createdBy: string;
}

export default function HomeScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [families, setFamilies] = useState<Family[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Charger les familles de l'utilisateur
        const familiesQuery = query(
          collection(db, 'families'),
          where('members', 'array-contains', user.uid),
        );

        const unsubscribeFamilies = onSnapshot(familiesQuery, (snapshot) => {
          const familiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Family[];
          setFamilies(familiesData);
        });

        return () => unsubscribeFamilies();
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
    router.push(`/family/${familyId}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Familles</Text>
        
        <View style={styles.headerActions}>
          {user ? (
            <>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/family/tutor-registration')}
              >
                <Text style={styles.createButtonText}>Créer une famille</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.profileButtonText}>👤</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>🚪</Text>
              </TouchableOpacity>
            </>
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
      <ScrollView style={styles.familiesContainer}>
        {families.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucune famille</Text>
            <Text style={styles.emptyStateText}>
              {user ? 'Créez votre première famille pour commencer' : 'Connectez-vous pour voir vos familles'}
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                    <Text style={styles.familyEmoji}>👶</Text>
                  )}
                </View>
                <Text style={styles.familyName}>{family.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
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
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  profileButtonText: {
    fontSize: 16,
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
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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
    marginRight: 16,
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