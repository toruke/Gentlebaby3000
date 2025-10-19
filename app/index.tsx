import { View } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Link
        href="/tutorRegistration"
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 8,
          fontWeight: '600',
        }}
      >
      👨‍👩‍👦‍👦
      </Link>
    </View>
  );
}
