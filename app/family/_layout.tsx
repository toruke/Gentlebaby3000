import { Stack } from 'expo-router';

export default function FamilyDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs de la famille */}
      <Stack.Screen name="(tabs)" />
      
      {/* Paramètres de la famille */}
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false,
          title: 'Paramètres famille',
          headerBackTitle: 'Retour',
        }} 
      />
    </Stack>
  );
}