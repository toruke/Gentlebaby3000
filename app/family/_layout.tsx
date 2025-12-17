import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>

      {/* CORRECTION : On cible "[id]/(tabs)" car c'est le chemin réel vu par le routeur */}
      <Stack.Screen
        name="[id]/(tabs)"
        options={{ headerShown: false }}
      />

      {/* ModifyRole est bien un enfant direct */}
      <Stack.Screen
        name="ModifyRole"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Modifier le rôle',
        }}
      />

      {/* Note : Vous n'êtes pas obligé de lister "[id]/settings" ou les autres 
         si vous n'avez pas d'options spécifiques à leur appliquer (comme cacher le header).
         Le Stack les chargera automatiquement s'ils sont appelés.
      */}
    </Stack>
  );
}