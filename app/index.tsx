import { View } from 'react-native';
import Button from '../src/components/Button';

export default function Index() {
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
