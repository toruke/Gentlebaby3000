import { Pressable, Text, View } from 'react-native';
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
        <View style={styles.header}>
          <Text style={styles.greeting}>Choisissez une famille :</Text>
        </View>
        <View style={stylesFamily.multipleFamily}>
          {families.map(fam => (
            <Pressable
              key={fam.id}
              onPress={() => selectFamily(fam.id)}>
              <Text style={stylesFamily.familyName}>{`Famille ${fam.name}`}</Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  }
  return <FamilyMembers familyMembers={family ?? []} />;

};