import { Tabs, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FamilyTabsLayout() {
  const params = useLocalSearchParams();
  const familyId = params.familyId || params.id;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6b46c1',
        tabBarInactiveTintColor: '#718096',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        // PERSONNALISER LE HEADER
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#6b46c1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Acceuil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ familyId }} // Passez l'ID ici aussi
      />
      <Tabs.Screen
        name="activity/index"
        options={{
          title: 'Santé',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ familyId }} // Passez l'ID ici aussi
      />
      <Tabs.Screen
        name="shifts/index"
        options={{
          title: 'Tours de Garde',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ familyId }} // Passez l'ID ici aussi
      />
      <Tabs.Screen
        name="planning/index"
        options={{
          title: 'Planning',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ familyId }} // Passez l'ID ici aussi
      />
      <Tabs.Screen
        name="management/index"
        options={{
          title: 'Gestion',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ familyId }} // Passez l'ID ici aussi
      />
    </Tabs>
  );
}