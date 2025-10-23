import { router } from 'expo-router';
import EditProfileForm from '../components/EditProfileForm';


export const EditProfileScreen = () => {

  const handleClose = async () => {
    router.push({ pathname: '/(screens)/profils', params: { refresh: Date.now() } });
  };


  return (

    <EditProfileForm onClose={handleClose} />
  );
};