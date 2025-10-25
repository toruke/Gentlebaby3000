import { db } from '@/config/firebaseConfig';
import { resend } from '@/lib/resend';
import Button from '@/src/components/Button';
import DropdownInput from '@/src/components/DropdownInput';
import QRModal from '@/src/components/qrCode';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Invite = () => {
  const [email, setEmail] = useState(''); // Email input state
  const [role, setRole] = useState('parent'); // Role selection state
  const [qrCodeVisible,setQrCodeVisible] = useState<boolean>(false);// QR code 
  const [families, setFamilies] = useState<{label:string,value:string}[]>([]); //Dropdown families
  const [familySelected, setFamilySelected] = useState(''); //dropdown selected family id

  useEffect(() => {
    const familiesData = onSnapshot(
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
      },
    );

    return () => familiesData();
  }, []);


  const handleSendInvitation = () => {
    // Logique pour envoyer l'invitation par email
    resend.emails.send({
      from: 'delivered@resend.dev', // email de test pour le developpement
      to: email,
      subject: 'Invitation à rejoindre GentleBaby3000',
      html: `
        <html>
          <body>
            <h1>Vous êtes invité à rejoindre GentleBaby3000</h1>
            <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
            <a href="https://votre-app.com/invite?email=${encodeURIComponent(email)}&familyId=${encodeURIComponent(familySelected)}&role=${encodeURIComponent(role)}">
              Accepter l'invitation
            </a>
          </body>
        </html>
      `,
    });
  };


  // jsx return
  return (

    <View
      className="flex-1 p-5 pb-10"
    >
      {/* Form Section */}
      <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm shadow-black/5">
        <Text className="text-lg font-bold text-gray-800 mb-5">
              Nouvelle invitation
        </Text>

        {/* Email Input Group */}
        <View className="mb-2">
          <Text className="mb-2">
                Adresse email
          </Text>
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
