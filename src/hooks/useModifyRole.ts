import { useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

export const useModifyRole = () =>{
  const { idUser,idFamily, name, role } = useLocalSearchParams();
  
  //to be sure it's a string and not an array
  const userId = Array.isArray(idUser) ? idUser[0] : idUser;
  const familyId = Array.isArray(idFamily) ? idFamily[0] : idFamily;
  const userName = Array.isArray(name) ? name[0] : name;
  const userRole = Array.isArray(role) ? role[0] : role;
  
  const handleSelect = (roleSelected: string) => {
    console.log(roleSelected);
    Alert.alert('Modification du role', `Etes-vous sur de changer le role de ${name} en ${roleSelected} ?`, [
      {
        text: 'Annuler',
        onPress: () => console.log('Cancel Pressed'),
      },
      {text: 'Confimer', onPress: () => console.log('OK Pressed')},
    ]);
  };
  return {handleSelect, userId, familyId, userName, userRole};
};
