import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function FamilyLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6b46c1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="tabs" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ title: 'Paramètres Famille' }} 
          />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}