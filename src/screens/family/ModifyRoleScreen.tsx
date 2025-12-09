import { Text, View } from 'react-native';
import { RoleList } from '../../components/RoleListe';
import { useModifyRole } from '../../hooks/useModifyRole';
import { stylesFamily } from '../../styles/FamilyManagementStyle';
import { styles } from '../../styles/globalStyles';
import { getUpperName } from '../../utils/familyUtils';

export default function ModifyRole() {
  const roleList = [{ id: '1', role: 'tuteur' }, { id: '2', role: 'tuteur secondaire' }, { id: '3', role: 'membre' }, { id: '4', role: 'enfant' }];
  //const {handleSelect, userId, familyId, userName, userRole} = useModifyRole();
  const { handleSelect, userName, userRole } = useModifyRole();


  return (
    <View>
      <Text style={[styles.header, styles.greeting]}>
        Modification du rôle
      </Text>
      <Text style={stylesFamily.text}>
        Le rôle actuel de {userName} est {getUpperName(userRole)}. {'\n'} Sélectionnez le nouveau rôle ci-dessous.
      </Text>
      <RoleList list={roleList} onSelect={handleSelect} getUpperName={getUpperName} />
    </View>
  );
}