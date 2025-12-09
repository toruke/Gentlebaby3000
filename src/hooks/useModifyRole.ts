import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { updateRoleUser } from '../services/ModifyRoleService';

export const useModifyRole = () =>{
  const { idUser,idFamily, name, role } = useLocalSearchParams();
  
  //to be sure it's a string and not an array
  const userId = Array.isArray(idUser) ? idUser[0] : idUser;
  const familyId = Array.isArray(idFamily) ? idFamily[0] : idFamily;
  const userName = Array.isArray(name) ? name[0] : name;
  const userRole = Array.isArray(role) ? role[0] : role;
  
  const confirmRoleChange = async (roleSelected: string) => {
    try {
      const roleModify = await updateRoleUser(userId,familyId,roleSelected);
      if (roleModify.includes('succès')){
        Alert.alert('Succès', `${name} a maintenant le rôle de ${roleSelected}.`);
      }
      else if (roleModify.includes('Accès refusé')){
        Alert.alert('Accès refusé', 'Seuls les tuteurs peuvent modifier les rôles');
      }
      else if (roleModify.includes('sélectionné')) {        
        Alert.alert('Pas de changement', 'Le rôle est déjà celui sélectionné');
      }
      else if (roleModify.includes('modifier votre propre rôle')) {        
        Alert.alert('Pas de changement', 'Vous ne pouvez pas modifié votre propre rôle');
      }
      else {
        Alert.alert('Erreur', 'Problème de connexion ou erreur lié à la base de donnée');

      }
      router.push({ pathname: '/family/[id]/(tabs)/management', params: {refresh :Date.now(), id: familyId}});
    }
    catch (error){
      console.log(error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification du rôle.');

    }
  };
  
  const handleSelect = async (roleSelected: string) => {
    console.log(roleSelected);
    Alert.alert('Modification du role', `Etes-vous sur de changer le role de ${name} en ${roleSelected} ?`, [
      {
        text: 'Annuler',
        onPress: () => console.log('Cancel Pressed'),
      },
      {text: 'Confirmer', onPress: () => {
        confirmRoleChange(roleSelected);
        console.log('OK Pressed');}},
    ]);
  };
  return {handleSelect, userId, familyId, userName, userRole};
};
