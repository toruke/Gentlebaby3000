import { View, Text} from 'react-native';
import { useFamilyManagement } from '../hooks/useFamilyManagement';
import { useModifyRole } from '../hooks/useModifyRole';
import { RoleList } from '../components/RoleListe';
import { styles } from '../styles/globalStyles';
import { stylesFamily } from '../styles/FamilyManagementStyle';

export default function ModifyRole(){
  const roleList = [{id: '1', role:'tuteur'}, {id: '2', role:'tuteur secondaire'}, {id: '3', role:'membre'}, {id: '4', role:'enfant'}];
  const {getUpperName} = useFamilyManagement();
  //const {handleSelect, userId, familyId, userName, userRole} = useModifyRole();
  const {handleSelect, userName, userRole} = useModifyRole();


  return (
    <View>
      <Text style={[styles.header, styles.greeting]}>
        Modification du rôle
      </Text>
      <Text style={stylesFamily.text}>
        Le rôle actuel de {userName} est {getUpperName(userRole)}. {'\n'} Sélectionnez le nouveau rôle ci-dessous.
      </Text>
      <RoleList list={roleList} onSelect={handleSelect} getUpperName={getUpperName}/>
    </View>
  );
}