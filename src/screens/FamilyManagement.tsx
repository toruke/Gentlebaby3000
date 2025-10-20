import { Pressable, Text, View } from 'react-native';
import { FamilyMembers } from '../components/FamilyMember';
import { useFamilyManagement } from '../hooks/useFamilyManagement';
import { styles } from '../styles/FamilyManagementStyle';

export default function FamilyManagement() {
  const { families, selectedFamily, family, loading, error, selectFamily } = useFamilyManagement();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text >Chargement...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (families.length > 1 && selectedFamily === '') {
    return (
      <View style={styles.multipleFamily}>
        <Text style={{ fontWeight: 'bold' }}>Choisissez une famille :</Text>
        {families.map(fam => (
          <Pressable key={fam.id} onPress={() => selectFamily(fam.id)}>
            <Text style={{ fontWeight: 'bold', marginVertical: 5 }}>
              {`Famille ${fam.name}`}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }
  return <FamilyMembers familyMembers={family ?? []} />;

};