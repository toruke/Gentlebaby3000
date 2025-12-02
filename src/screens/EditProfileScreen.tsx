import { router } from 'expo-router';
import EditProfileForm from '../components/EditProfileForm';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundShapes from '../components/backgroundShapes';


export const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const handleClose = async () => {
    router.push({ pathname: '/(tabs)/profile', params: { refresh: Date.now() } });
  };


  return (
    <View style={styles.fullScreenContainer}>
      <BackgroundShapes style={StyleSheet.absoluteFillObject} />
            
      <View style={{ 
        flex: 1,
        paddingTop: insets.top + 56,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
        <EditProfileForm onClose={handleClose} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
});