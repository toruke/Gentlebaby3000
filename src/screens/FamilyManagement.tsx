import {  View, Text } from 'react-native';
import { FamilyMembers } from '../components/FamilyMember';
import { useFamilyManagement } from '../hoocks/useFamilyManagement';
import { styles } from '../styles/FamilyManagementStyle';

export default function FamilyManagement() {
  const {family, loading, error} = useFamilyManagement();

  return (
    <>
      {loading ? (
        <>
          <View style={styles.loading}>
            <Text >Chargement...</Text>
          </View>
        </>
      ):
        error.length !==0 ? (
          <>
            <View>
              <Text style={styles.error}>{error}</Text>
            </View>
          </>
        ):
          (<FamilyMembers familyMembers={family ?? []} />)
      }
    </>
  );
};