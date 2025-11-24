import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack
      screenOptions={{
        // DÉSACTIVER LE HEADER POUR TOUTES LES ROUTES FAMILLE
        headerShown: false,
      }}
    >
      {/* Route famille avec tabs internes */}
      <Stack.Screen name="[id]" />
      
      {/* Paramètres famille */}
      <Stack.Screen 
        name="[id]/settings" 
        options={{ 
          // Réactiver le header uniquement pour les settings
          headerShown: true,
          title: 'Paramètres famille',
          headerBackTitle: 'Retour',
        }} 
      />
    </Stack>
  );
}