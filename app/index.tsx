import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Button from '../components/Button';


export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Button 
        title="InviteGeneral" 
        onPress={() => router.push('/invite')} 
      />
      
      <View className="h-10" />
    </View>
  );
}
