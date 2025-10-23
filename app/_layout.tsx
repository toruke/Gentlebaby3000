import { Stack } from 'expo-router';
import '../global.css';
import Toast from 'react-native-toast-message';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: 'Accueil' }} />
        <Stack.Screen
          name="tutorRegistration"
          options={{ title: 'Family' }}
        />
      </Stack>

      {/* Composant Toast */}
      <Toast />
    </>
  );
}
