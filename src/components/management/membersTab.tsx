import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// On définit une interface qui correspond à vos données Firebase
interface FamilyMemberUI {
  userId: string;
  displayName?: string;
  email?: string; // Optionnel selon vos données
  role: string;
  photoUrl?: string; // Si vous l'ajoutez plus tard
}

interface MembersTabProps {
  members: FamilyMemberUI[];
  onInvite: () => void;
}

export default function MembersTab({ members, onInvite }: MembersTabProps) {
  
  // Fonction pour obtenir les initiales si pas de photo
  const getInitials = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <View style={styles.container}>
      
      {/* Bouton d'invitation */}
      <TouchableOpacity style={styles.inviteButton} onPress={onInvite}>
        <Text style={styles.inviteButtonText}>+ Inviter un nouveau membre</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Membres actuels ({members.length})</Text>

      {members && members.length > 0 ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item.userId} // C'est 'userId' dans votre service, pas 'uid'
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              
              {/* Avatar: Image ou Initiale */}
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>{getInitials(item.displayName)}</Text>
                </View>
              )}

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.displayName || 'Membre sans nom'}
                </Text>
                <Text style={styles.itemSub}>
                  {/* Mise en majuscule simple */}
                  {item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : 'Membre'}
                </Text>
              </View>

              {/* Badge si Admin/Tuteur */}
              {(item.role === 'admin' || item.role === 'tuteur') && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>Admin</Text>
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Aucun membre trouvé.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginVertical: 15 },
  emptyText: { color: '#718096', fontStyle: 'italic', marginTop: 10 },
  
  // Bouton Inviter
  inviteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6b46c1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderStyle: 'dashed',
  },
  inviteButtonText: { color: '#6b46c1', fontSize: 16, fontWeight: '600' },

  // Carte Membre
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  avatarPlaceholder: { backgroundColor: '#6b46c1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  itemSub: { fontSize: 14, color: '#718096' },
  
  adminBadge: { backgroundColor: '#E9D8FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  adminText: { color: '#6b46c1', fontSize: 10, fontWeight: 'bold' },
});