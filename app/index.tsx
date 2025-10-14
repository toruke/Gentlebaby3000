import { View } from 'react-native';
import Button from '../components/Button';

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button title="caca" onPress={() => {}} />
    </View>
  );
}
