import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';


interface Invitation {
  id: string;
  acceptedAt: Timestamp;
  createdAt: Timestamp;
  emailInvited: string;
  expiredAt: Timestamp;
  familyId: string;
  roleProposed: string;
  senderId: string;
  status: string;
  tokenInvitation: string;
}


const InviteFamilyScreen = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('parent');
  const [isLoading, setIsLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<Invitation[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'invitation'),
      (querySnapshot) => {
        const members = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Invitation[];

        setInvitedMembers(members);
      },
      (error) => {
        console.error('Erreur:', error);
      },
    );

    return () => unsubscribe();
  }, []);


  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email valide');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const newInvitation = {
        id: Date.now().toString(),
        email: email.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        role:
          role === 'parent'
            ? 'Parent'
            : role === 'proche'
              ? 'Proche'
              : 'Nourrice',
        status: 'pending',
        invitedAt: 'À l\'instant',
      };

      setInvitedMembers([newInvitation, ...invitedMembers]);

      Alert.alert(
        '✅ Invitation envoyée',
        `Une invitation a été envoyée à ${email}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              setFirstName('');
              setLastName('');
              setRole('parent');
            },
          },
        ],
      );
    }, 1500);
  };

  const handleCancelInvitation = (invitationId: string, memberName: string) => {
    Alert.alert(
      'Annuler l\'invitation',
      `Voulez-vous vraiment annuler l'invitation de ${memberName} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            setInvitedMembers(
              invitedMembers.filter((member) => member.id !== invitationId),
            );
            Alert.alert('✅', 'Invitation annulée');
          },
        },
      ],
    );
  };

  const handleResendInvitation = (email: string) => {
    Alert.alert('✅', `Invitation renvoyée à ${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' backgroundColor='#fff' />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoCard}>
            <Ionicons name='information-circle' size={24} color='#007AFF' />
            <Text style={styles.infoText}>
              Invitez des membres de votre famille pour partager la garde de
              bébé et l'accès à l'application.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Nouvelle invitation</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Adresse email <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name='mail-outline'
                  size={20}
                  color='#666'
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='exemple@email.com'
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor='#999'
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rôle dans la famille</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'parent' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('parent')}
                >
                  <Ionicons
                    name='people'
                    size={20}
                    color={role === 'parent' ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'parent' && styles.roleButtonTextActive,
                    ]}
                  >
                    Parent
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'proche' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('proche')}
                >
                  <Ionicons
                    name='heart'
                    size={20}
                    color={role === 'proche' ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'proche' && styles.roleButtonTextActive,
                    ]}
                  >
                    Proche
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'nourrice' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('nourrice')}
                >
                  <Ionicons
                    name='medkit'
                    size={20}
                    color={role === 'nourrice' ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'nourrice' && styles.roleButtonTextActive,
                    ]}
                  >
                    Nourrice
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                isLoading && styles.sendButtonDisabled,
              ]}
              onPress={handleSendInvitation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <>
                  <Ionicons
                    name='paper-plane'
                    size={20}
                    color='#fff'
                    style={styles.sendIcon}
                  />
                  <Text style={styles.sendButtonText}>
                    Envoyer l'invitation
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {invitedMembers.length > 0 && (
            <View style={styles.invitationsSection}>
              <Text style={styles.sectionTitle}>
                Invitations envoyées ({invitedMembers.length})
              </Text>

              {invitedMembers.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <View
                      style={[
                        styles.memberAvatar,
                        member.status === 'accepted'
                          ? styles.avatarAccepted
                          : styles.avatarPending,
                      ]}
                    >
                      <Ionicons
                        name={
                          member.status === 'accepted'
                            ? 'checkmark'
                            : 'time-outline'
                        }
                        size={24}
                        color='#fff'
                      />
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                      <View style={styles.memberMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            member.status === 'accepted'
                              ? styles.statusAccepted
                              : styles.statusPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              member.status === 'accepted'
                                ? styles.statusTextAccepted
                                : styles.statusTextPending,
                            ]}
                          >
                            {member.status === 'accepted'
                              ? 'Accepté'
                              : 'En attente'}
                          </Text>
                        </View>
                        <Text style={styles.memberRole}>• {member.role}</Text>
                        <Text style={styles.memberDate}>
                          • {member.invitedAt}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {member.status === 'pending' && (
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleResendInvitation(member.email)}
                      >
                        <Ionicons name='refresh' size={18} color='#007AFF' />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() =>
                          handleCancelInvitation(member.id, member.name)
                        }
                      >
                        <Ionicons
                          name='trash-outline'
                          size={18}
                          color='#FF3B30'
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  invitationsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarAccepted: {
    backgroundColor: '#34C759',
  },
  avatarPending: {
    backgroundColor: '#FF9500',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusAccepted: {
    backgroundColor: '#D1F2DD',
  },
  statusPending: {
    backgroundColor: '#FFE8CC',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextAccepted: {
    color: '#28A745',
  },
  statusTextPending: {
    color: '#FF9500',
  },
  memberRole: {
    fontSize: 12,
    color: '#666',
  },
  memberDate: {
    fontSize: 12,
    color: '#999',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
});

export default InviteFamilyScreen;
