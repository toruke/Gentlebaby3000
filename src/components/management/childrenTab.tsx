import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Timestamp } from 'firebase/firestore'; 

import { Child } from '@/src/models/child';

import defaultAvatarGirl from '@/assets/images/default-avatar-girl.png';
import defaultAvatar from '@/assets/images/default-avatar.png';

interface ChildrenTabProps {
  childrenData: Child[]; 
  familyId: string;
}

// 🟢 TYPE FLEXIBLE : On accepte les variantes possibles venant de Firebase
// Cela permet de lire 'birthDate' (DB) ou 'birthday' (Modèle) sans erreur
type ChildData = Child & { 
  id?: string; 
  birthDate?: Timestamp | Date; 
  gender?: string; // On accepte string pour gérer les majuscules éventuelles
};

export default function ChildrenTab({ childrenData, familyId }: ChildrenTabProps) {
  const router = useRouter();
  
  const safeChildren = childrenData || [];
  const hasChildren = safeChildren.length > 0;

  // --- 1. CALCUL DE L'ÂGE ROBUSTE ---
  const getAge = (dateInput: Date | Timestamp | undefined): string => {
    if (!dateInput) return ''; // Pas de date, pas d'affichage
    
    let birthDate: Date;
    
    if (dateInput instanceof Timestamp) {
      birthDate = dateInput.toDate();
    } else {
      birthDate = dateInput as Date;
    }

    if (isNaN(birthDate.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Affichage en mois pour les bébés < 1 an
    if (age === 0) {
      let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
      if (today.getDate() < birthDate.getDate()) months--;
      return `${Math.max(0, months)} mois`;
    }

    return `${age} ans`;
  };
  
  const handleGoToCreate = () => {
    router.push({
      pathname: `/family/${familyId}/child`, 
    });
  };

  const handleGoToProfile = (child: ChildData) => {
    const targetId = child.childId || child.id;

    if (!targetId) {
      console.error('❌ Erreur Navigation : ID enfant manquant', child);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le profil : ID manquant.');
      return;
    }

    router.push({
      pathname: `/family/${familyId}/child/${targetId}`,
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
        keyExtractor={(item) => {
          const itemData = item as ChildData;
          return item.childId || itemData.id || Math.random().toString();
        }}
        scrollEnabled={false}
        renderItem={({ item }) => {
          // 🟢 Conversion vers notre type flexible
          const childItem = item as ChildData;
          
          // --- 2. GESTION DU GENRE ---
          // On normalise en minuscule pour éviter les soucis (Female vs female)
          const genderNormalized = childItem.gender ? childItem.gender.toLowerCase() : '';
          
          let genderLabel = 'Enfant';
          if (genderNormalized === 'male') genderLabel = 'Garçon';
          else if (genderNormalized === 'female') genderLabel = 'Fille';

          // --- 3. GESTION DE L'AVATAR ---
          const avatarSource = genderNormalized === 'female' ? defaultAvatarGirl : defaultAvatar;
          
          // --- 4. GESTION DE LA DATE ---
          // On prend celle qui existe
          const dateToUse = childItem.birthDate || childItem.birthday;

          return (
            <TouchableOpacity 
              style={styles.cardItem} 
              onPress={() => handleGoToProfile(childItem)}
            >
              <Image source={avatarSource} style={styles.itemImage} />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{childItem.firstName} {childItem.lastName}</Text>
                
                <View style={styles.subInfoRow}>
                  <Text style={styles.itemSub}>
                    {genderLabel}
                  </Text>
                    
                  {/* N'affiche le point et l'âge que si la date existe */}
                  {dateToUse && (
                    <>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.ageText}>
                        {getAge(dateToUse)}
                      </Text>
                    </>
                  )}
                </View>
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
  mainActionButton: {
    backgroundColor: '#6b46c1', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, elevation: 3,
  },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryActionButton: { alignSelf: 'flex-end', marginBottom: 10, padding: 8 },
  secondaryActionText: { color: '#6b46c1', fontWeight: '600' },
  cardItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  itemImage: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  
  // Styles alignés
  subInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  itemSub: { fontSize: 14, color: '#718096' },
  dot: { marginHorizontal: 6, color: '#CBD5E0', fontSize: 10 },
  ageText: { fontSize: 14, fontWeight: '700', color: '#6b46c1' },

  chevronContainer: { padding: 5 },
  chevron: { fontSize: 18, color: '#CBD5E0', fontWeight: 'bold' },
});