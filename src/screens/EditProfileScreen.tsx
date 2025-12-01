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
      {/* Le fond s'étend sur tout l'écran, zIndex: -1 est dans BackgroundShapes */}
      <BackgroundShapes style={StyleSheet.absoluteFillObject} />
            
      {/* 2. Appliquer les insets comme padding au conteneur du formulaire */}
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