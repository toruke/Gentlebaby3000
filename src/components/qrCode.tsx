import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRModalProps {
  onClose: () => void; 
}

export default function QRModal({ onClose }: QRModalProps) {
  const qrValue = 'https://votre-app.com/invite'; // ajouter lien ici

  return (
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white p-5 rounded-lg items-center shadow-lg w-4/5">
        <View className="justify-center items-center mb-5">
          <QRCode
            value={qrValue}
            size={300}
            color="black"
            backgroundColor="white"
          />
        </View>
        <TouchableOpacity className="bg-red-500 p-2.5 rounded w-full" onPress={onClose}>
          <Text className="text-white text-center font-bold">Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
