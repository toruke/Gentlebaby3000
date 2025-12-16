import { db } from '@/config/firebaseConfig';
import Button from '@/src/components/Button';
import DropdownInput from '@/src/components/DropdownInput';
import QRModal from '@/src/components/qrCode';
import { getCurrentAuthUser } from '@/src/services/auth';
import { sendInvitationEmail } from '@/src/services/emailService';
import { createInvitation, generateInvitationLink } from '@/src/services/invitationService';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Invite = () => {
  // États
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('parent');
  const [qrCodeVisible, setQrCodeVisible] = useState<boolean>(false);
  const [families, setFamilies] = useState<{label: string, value: string}[]>([]);
  const [familySelected, setFamilySelected] = useState('');
  const [loading, setLoading] = useState(false); // État de chargement

  // Récupérer les familles de l'utilisateur
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'family'),
      (querySnapshot) => {
        const familiesList = querySnapshot.docs.map((doc) => ({
          label: doc.data().name,
          value: doc.id,
        }));
        setFamilies(familiesList); 
      },
      (error) => {
        console.error('Erreur lors de la récupération des familles :', error);
        Alert.alert('Erreur', 'Impossible de charger les familles');
      },
    );

    return () => unsubscribe();
  }, []);

  // Fonction d'envoi d'invitation
  const handleSendInvitation = async () => {
    // 1. Validation de l'email
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email');
      return;
    }

    // 2. Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Adresse email invalide');
      return;
    }

    // 3. Validation de la famille sélectionnée
    if (!familySelected) {
      Alert.alert('Erreur', 'Veuillez sélectionner une famille');
      return;
    }

    try {
      setLoading(true);

      // 4. Créer l'invitation dans Firestore
      const { invitationId, token } = await createInvitation(
        familySelected,
        email,
        role,
      );

      // 5. Générer le lien d'invitation
      const invitationLink = generateInvitationLink(invitationId, token);

      // 6. Envoyer l'email
      const user = getCurrentAuthUser();
      const selectedFamily = families.find(f => f.value === familySelected);
      
      await sendInvitationEmail(
        email,
        user.displayName || 'Un membre',
        selectedFamily?.label || 'votre famille',
        invitationLink,
      );

      // 7. Confirmer le succès
      Alert.alert(
        'Invitation envoyée ! ✅',
        `Un email a été envoyé à ${email}`,
        [{ text: 'OK' }],
      );

      // 8. Réinitialiser le formulaire
      setEmail('');
      setRole('parent');

    } catch (error: unknown) {
      console.error('Erreur invitation:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Impossible d\'envoyer l\'invitation';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-5 pb-10">
      {/* Form Section */}
      <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm shadow-black/5">
        <Text className="text-lg font-bold text-gray-800 mb-5">
          Nouvelle invitation
        </Text>

        {/* Email Input */}
        <View className="mb-2">
          <Text className="mb-2">Adresse email</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 px-4 h-12">
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
              editable={!loading}
            />
          </View>
        </View>

        {/* Family Dropdown */}
        <DropdownInput
          options={families}
          selectedValue={familySelected}
          onValueChange={setFamilySelected}
        />

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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
          title={loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
          onPress={handleSendInvitation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color='#fff' style={{ marginRight: 8 }} />
          ) : (
            <Ionicons
              name='paper-plane'
              size={20}
              color='#fff'
              style={{ marginRight: 8 }}
            />
          )}
        </Button>

        {/* QR Button */}
        <Button
          title='Utilisez un QR code'
          onPress={() => setQrCodeVisible(true)}
          className='mt-2'
          disabled={loading}
        >
          <Ionicons name='qr-code-outline' size={20} color='#fff' />
        </Button>

        <Modal
          animationType="fade"
          transparent={true}
          visible={qrCodeVisible}
          onRequestClose={() => setQrCodeVisible(false)}
        >
          <QRModal onClose={() => setQrCodeVisible(false)} />
        </Modal>
      </View>
    </View>
  );
};

export default Invite;