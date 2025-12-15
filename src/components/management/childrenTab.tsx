import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Timestamp } from 'firebase/firestore'; // <--- AJOUT IMPORTANT

import { Child } from '@/src/models/child';
import defaultAvatarGirl from '@/assets/images/default-avatar-girl.png';
import defaultAvatar from '@/assets/images/default-avatar.png';

interface ChildrenTabProps {
  childrenData: Child[]; 
  familyId: string;
}

export default function ChildrenTab({ childrenData, familyId }: ChildrenTabProps) {
  const router = useRouter();
  
  const safeChildren = childrenData || [];
  const hasChildren = safeChildren.length > 0;

  // CORRECTION : On type explicitement birthday
  const getAge = (birthday: Date | Timestamp | undefined) => {
    if (!birthday) return '';
    
    // Vérification du type : est-ce un Timestamp Firebase ou une Date JS ?
    const birthDate = (birthday as Timestamp).toDate ? (birthday as Timestamp).toDate() : new Date(birthday as Date);
    
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs); 
    return Math.abs(ageDate.getUTCFullYear() - 1970) + ' ans';
  };
  
  const handleGoToCreate = () => {
    router.push({
      pathname: `/family/${familyId}/child`, 
    });
  };

  const handleGoToProfile = (child: Child) => {
    router.push({
      // CORRECTION : On utilise child.childId défini dans ton modèle
      pathname: `/family/${familyId}/child/${child.childId}`,
    });
  };

  if (!hasChildren) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Aucun enfant pour le moment</Text>
        <Text style={styles.emptySubtitle}>
          Ajoutez le profil de votre enfant pour commencer le suivi.
        </Text>
        <TouchableOpacity style={styles.mainActionButton} onPress={handleGoToCreate}>
          <Text style={styles.mainActionText}>+ Ajouter un enfant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.secondaryActionButton} onPress={handleGoToCreate}>
        <Text style={styles.secondaryActionText}>+ Ajouter un autre enfant</Text>
      </TouchableOpacity>

      <FlatList
        data={safeChildren}
        // CORRECTION : Plus de 'any', on utilise les propriétés du modèle Child
        keyExtractor={(item) => item.childId || Math.random().toString()}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const avatarSource = item.gender === 'female' ? defaultAvatarGirl : defaultAvatar;
          
          return (
            <TouchableOpacity 
              style={styles.cardItem} 
              onPress={() => handleGoToProfile(item)}
            >
              <Image source={avatarSource} style={styles.itemImage} />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.itemSub}>
                  {item.gender === 'male' ? 'Garçon' : item.gender === 'female' ? 'Fille' : 'Enfant'} 
                  {' • '} 
                  {getAge(item.birthday)}
                </Text>
              </View>
              
              <View style={styles.chevronContainer}>
                <Text style={styles.chevron}>{'>'}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 24 },
  mainActionButton: { backgroundColor: '#6b46c1', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, elevation: 3 },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryActionButton: { alignSelf: 'flex-end', marginBottom: 10, padding: 8 },
  secondaryActionText: { color: '#6b46c1', fontWeight: '600' },
  cardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  itemImage: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  itemSub: { fontSize: 14, color: '#718096' },
  chevronContainer: { padding: 5 },
  chevron: { fontSize: 18, color: '#CBD5E0', fontWeight: 'bold' },
});