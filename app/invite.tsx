import Button from '@/src/components/Button';
import QRModal from '@/src/components/qrCode';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

const Invite = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('parent');
  const [isLoading, setIsLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<Invitation[]>([]);
  const [qrCodeVisible,setQrCodeVisible] = useState<boolean>(false);

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
        createdAt: 'À l\'instant',
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

    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1"
      contentContainerClassName="p-5 pb-10"
    >
      {/* Info Card */}
      <View className="flex-row bg-blue-50 p-4 rounded-xl mb-6">
        <Ionicons name='information-circle' size={24} color='#007AFF' />
        <Text className="flex-1 ml-3 text-sm text-blue-600 leading-5">
              Invitez des membres de votre famille pour partager la garde de bébé et l'accès à l'application.
        </Text>
      </View>

      {/* Form Section */}
      <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm shadow-black/5">
        <Text className="text-lg font-bold text-gray-800 mb-5">
              Nouvelle invitation
        </Text>

        {/* Email Input Group */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
                Adresse email <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 h-12">
            <Ionicons
              name='mail-outline'
              size={20}
              color='#666'
              style={{ marginRight: 10 }}
            />
            <TextInput
              className="flex-1 text-base text-gray-700"
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

        {/* Role Selection */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
                Rôle dans la famille
          </Text>
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className={`
                    flex-1 flex-row items-center justify-center
                    border-2 rounded-xl py-3 gap-1.5
                    ${role === 'parent'
      ? 'bg-blue-500 border-blue-500'
      : 'bg-gray-50 border-gray-200'
    }
                  `}
              onPress={() => setRole('parent')}
            >
              <Ionicons
                name='people'
                size={20}
                color={role === 'parent' ? '#fff' : '#666'}
              />
              <Text
                className={`
                      text-sm font-semibold
                      ${role === 'parent' ? 'text-white' : 'text-gray-600'}
                    `}
              >
                    Parent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`
                    flex-1 flex-row items-center justify-center
                    border-2 rounded-xl py-3 gap-1.5
                    ${role === 'proche'
      ? 'bg-blue-500 border-blue-500'
      : 'bg-gray-50 border-gray-200'
    }
                  `}
              onPress={() => setRole('proche')}
            >
              <Ionicons
                name='heart'
                size={20}
                color={role === 'proche' ? '#fff' : '#666'}
              />
              <Text
                className={`
                      text-sm font-semibold
                      ${role === 'proche' ? 'text-white' : 'text-gray-600'}
                    `}
              >
                    Proche
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`
                    flex-1 flex-row items-center justify-center
                    border-2 rounded-xl py-3 gap-1.5
                    ${role === 'nourrice'
      ? 'bg-blue-500 border-blue-500'
      : 'bg-gray-50 border-gray-200'
    }
                  `}
              onPress={() => setRole('nourrice')}
            >
              <Ionicons
                name='medkit'
                size={20}
                color={role === 'nourrice' ? '#fff' : '#666'}
              />
              <Text
                className={`
                      text-sm font-semibold
                      ${role === 'nourrice' ? 'text-white' : 'text-gray-600'}
                    `}
              >
                    Nourrice
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Send Button */}
        <Button
          title="Envoyer l'invitation"
          onPress={handleSendInvitation}
          className={isLoading ? 'bg-gray-300 shadow-none' : ''}
          disabled={isLoading}
        >
          <Ionicons
            name='paper-plane'
            size={20}
            color='#fff'
            style={{ marginRight: 8 }}
          />
        </Button>

        { /* QR Button */}
        <Button
          title='Utilisez un QR code'
          onPress={()=>{setQrCodeVisible(true);}}
          className='mt-2 '
        >
          <Ionicons name='qr-code-outline' size={20} color='#fff' />
        </Button>

        <Modal
          animationType="slide"
          transparent={true}
          visible={qrCodeVisible}
          onRequestClose={() => setQrCodeVisible(false)}
        >
          <QRModal onClose={() => setQrCodeVisible(false)} />
        </Modal>

      </View>

      {/* Invitations Section */}
      {invitedMembers.length > 0 && (
        <View className="bg-white p-5 rounded-2xl shadow-sm shadow-black/5">
          <Text className="text-lg font-bold text-gray-800 mb-4">
                Invitations envoyées ({invitedMembers.length})
          </Text>

          {invitedMembers.map((member) => (
            <View key={member.id} className="flex-row items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <View className="flex-1 flex-row items-center">
                {/* Avatar */}
                <View
                  className={`w-12 h-12 rounded-full justify-center items-center mr-3 ${
                    member.status === 'accepted'
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}
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

                {/* Member Details */}
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {member.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1.5">
                    {member.email}
                  </Text>
                  <View className="flex-row items-center flex-wrap gap-1.5">
                    {/* Status Badge */}
                    <View
                      className={`px-2 py-0.5 rounded-md ${
                        member.status === 'accepted'
                          ? 'bg-green-100'
                          : 'bg-orange-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          member.status === 'accepted'
                            ? 'text-green-700'
                            : 'text-orange-600'
                        }`}
                      >
                        {member.status === 'accepted'
                          ? 'Accepté'
                          : 'En attente'}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">• {member.role}</Text>
                    <Text className="text-xs text-gray-400">• {member.invitedAt}</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              {member.status === 'pending' && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="w-9 h-9 rounded-full bg-gray-100 justify-center items-center"
                    onPress={() => handleResendInvitation(member.email)}
                  >
                    <Ionicons name='refresh' size={18} color='#007AFF' />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-9 h-9 rounded-full bg-red-50 justify-center items-center"
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
  );
};

export default Invite;
