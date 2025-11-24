import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* UTILISER LES ROUTES RÉELLES */}
      <Stack.Screen name="[id]/(tabs)" />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: true,
          title: 'Paramètres famille',
          headerBackTitle: 'Retour',
        }} 
      />
    </Stack>
  );
}