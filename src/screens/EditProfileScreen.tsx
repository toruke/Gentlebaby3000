import { router } from 'expo-router';
import EditProfileForm from '../components/EditProfileForm';


export const EditProfileScreen = () => {

  const handleClose = async () => {
    router.push({ pathname: '/(tabs)/profile', params: { refresh: Date.now() } });
  };


  return (

    <EditProfileForm onClose={handleClose} />
  );
};