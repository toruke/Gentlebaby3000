import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="inviteFamilyScreen" />
      </Stack>
    </SafeAreaProvider>
  );
}
