import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Les Onglets (Dashboard, Santé, etc.)
         Attention : le nom est "(tabs)", pas "[id]/(tabs)" 
      */}
      <Stack.Screen name="(tabs)" />

      {/* 2. Le dossier Child
         Maintenant que child/_layout.tsx existe, ce nom est valide !
         Les options de transparence sont gérées DANS child/_layout.tsx, 
         donc on n'a rien à mettre ici.
      */}
      <Stack.Screen name="child" /> 
    </Stack>
  );
}