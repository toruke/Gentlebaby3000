import { Stack } from 'expo-router';
import React from 'react';

export default function ChildLayout() {
  return (
    <Stack
      screenOptions={{
        // C'est ICI qu'on définit que tout le dossier est une modale transparente
        presentation: 'transparentModal',
        headerShown: false,
        animation: 'fade',
        // Important pour la transparence réelle sur Android/iOS
        contentStyle: { backgroundColor: 'transparent' }, 
      }}
    >
      {/* Route pour child/index.tsx (Création) */}
      <Stack.Screen name="index" />
      
      {/* Route pour child/[childId]/index.tsx (Profil) */}
      <Stack.Screen name="[childId]/index" />
    </Stack>
  );
}