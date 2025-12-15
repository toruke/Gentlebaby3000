import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Member {
  userId: string;
  role: string;
  displayName?: string;
  photoUrl?: string;
  email?: string;
  device?: string | null; // 🟢 SINGULIER pour être cohérent avec le reste
}

interface MembersTabProps {
  members: Member[];
  familyId: string;
  onInvite: () => void;
  onManageDevice: (member: Member) => void;
}

export default function MembersTab({ members, familyId, onInvite, onManageDevice }: MembersTabProps) {
  const router = useRouter();

  const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : '?';

  const handleModifyRole = (member: Member) => {
    router.push({
      pathname: '/family/ModifyRole',
      params: { 
        idUser: member.userId,
        idFamily: familyId,
        name: member.displayName || 'Membre',
        role: member.role,
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inviteButton} onPress={onInvite}>
        <Text style={styles.inviteButtonText}>+ Inviter un nouveau membre</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Membres actuels ({members.length})</Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <View style={styles.topRow}>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>{getInitials(item.displayName)}</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.displayName || 'Membre sans nom'}</Text>
                <Text style={styles.itemSub}>{item.role}</Text>
              </View>
              {/* 🟢 Badge affiché si item.device existe */}
              {item.device && (
                <View style={styles.deviceBadge}>
                  <Text style={styles.deviceBadgeText}>📡 Connected</Text>
                </View>
              )}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleModifyRole(item)}
              >
                <Text style={styles.actionText}>Modifier Rôle</Text>
              </TouchableOpacity>

              {/* 🟢 Vérification sur item.device */}
              <TouchableOpacity 
                style={[styles.actionButton, item.device ? styles.actionDissociate : styles.actionAssociate]}
                onPress={() => onManageDevice(item)}
              >
                <Text style={[styles.actionText, item.device ? styles.textDanger : styles.textPrimary]}>
                  {item.device ? 'Dissocier Appareil' : 'Associer Babyphone'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginVertical: 15 },
  inviteButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#6b46c1', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderStyle: 'dashed' },
  inviteButtonText: { color: '#6b46c1', fontSize: 16, fontWeight: '600' },
  
  cardItem: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  avatarPlaceholder: { backgroundColor: '#6b46c1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  itemSub: { fontSize: 14, color: '#718096', textTransform: 'capitalize' },
  
  deviceBadge: { backgroundColor: '#C6F6D5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  deviceBadgeText: { color: '#22543D', fontSize: 10, fontWeight: 'bold' },

  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  actionButton: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  actionAssociate: { backgroundColor: '#EBF8FF', borderRadius: 8, marginLeft: 8 },
  actionDissociate: { backgroundColor: '#FFF5F5', borderRadius: 8, marginLeft: 8 },
  
  actionText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  textPrimary: { color: '#3182CE' },
  textDanger: { color: '#E53E3E' },
});