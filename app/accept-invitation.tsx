import { db } from '@/config/firebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export default function AcceptInvitationScreen() {
  const { id, token } = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');

  useEffect(() => {
    verifyInvitation();
  }, []);

  const verifyInvitation = async () => {
    try {
      const invitationRef = doc(db, 'invitations', id as string);
      const invitationSnap = await getDoc(invitationRef);

      if (!invitationSnap.exists()) {
        setStatus('invalid');
        return;
      }

      const data = invitationSnap.data();
      
      // Vérifier le token
      if (data.tokenInvitation !== token) {
        setStatus('invalid');
        return;
      }

      // Vérifier l'expiration
      if (data.expiredAt.toDate() < new Date()) {
        setStatus('invalid');
        return;
      }

      // Vérifier si déjà acceptée
      if (data.status !== 'pending') {
        setStatus('invalid');
        return;
      }

      setStatus('valid');

    } catch (error) {
      console.error('Erreur vérification:', error);
      setStatus('invalid');
    }
  };

  const acceptInvitation = async () => {
    // TODO: Logique d'ajout du membre à la famille
    // + mise à jour du statut de l'invitation
  };

  if (status === 'loading') {
    return <ActivityIndicator size="large" />;
  }

  if (status === 'invalid') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>❌ Invitation invalide ou expirée</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>👶 Invitation GentleBaby</Text>
      <Text>Vous êtes invité à rejoindre une famille !</Text>
      <TouchableOpacity onPress={acceptInvitation} style={{ marginTop: 30 }}>
        <Text>Accepter</Text>
      </TouchableOpacity>
    </View>
  );
}