import { Stack } from 'expo-router';
import '../global.css';
import Toast from 'react-native-toast-message';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerTitleAlign: 'center', headerShown: true }}>
        <Stack.Screen name="index" options={{ title: 'Accueil' }} />
        {/* SIMPLIFIER les noms */}
        <Stack.Screen name="auth/signup" options={{ title: 'Inscription' }} />
        <Stack.Screen name="auth/profile" options={{ title: 'Mon profil' }} />
         <Stack.Screen name="index" options={{ title: 'Accueil' }} />
          <Stack.Screen name="tutorRegistration" options={{ title: 'Family' } />
      </Stack>
      <Toast />
    </>
  );
}
