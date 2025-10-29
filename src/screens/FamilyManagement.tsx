import {  Text, View, TouchableOpacity } from 'react-native';
import { FamilyMembers } from '../components/FamilyMember';
import { useFamilyManagement } from '../hooks/useFamilyManagement';
import { styles } from '../styles/globalStyles';
import {stylesFamily} from '../styles/FamilyManagementStyle';
export default function FamilyManagement() {
  const { families, selectedFamily, family, loading, error, selectFamily } = useFamilyManagement();

  if (loading) {
    return (
      <View style={stylesFamily.loading}>
        <Text >Chargement...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View>
        <Text style={stylesFamily.error}>{error}</Text>
      </View>
    );
  }
  if (families.length > 1 && selectedFamily === '') {
    return (
      <>
        <View>
          <Text style={[styles.header, styles.greeting]}>Choix famille</Text>

          <Text style={stylesFamily.text}>Choisissez une famille :</Text>

          {families.map(fam => (
            <TouchableOpacity
              style={stylesFamily.roleItem}
              key={fam.id}
              onPress={() => selectFamily(fam.id)}>
              <Text style={stylesFamily.roleText}>{`Famille ${fam.name}`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  }
  return <FamilyMembers familyMembers={family ?? []} />;

};