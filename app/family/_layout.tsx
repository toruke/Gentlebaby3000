import { Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function FamilyLayout() {
  const { id } = useLocalSearchParams();
  
  console.log('🏠 FamilyLayout - ID:', id); // Debug
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Utilisez initialParams pour passer l'ID à toutes les screens enfants */}
      <Stack.Screen
        name="(tabs)"
        initialParams={{ familyId: id }}
      />
    </Stack>
  );
}