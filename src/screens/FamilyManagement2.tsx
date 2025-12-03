import {  Text, View } from 'react-native';
import { FamilyMembers } from '../components/FamilyMember2';
import { useFamilyManagement } from '../hooks/useFamilyManagement';
import {stylesFamily} from '../styles/FamilyManagementStyle';
export default function FamilyManagement() {
  const { family, loading, error } = useFamilyManagement();

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
  return <FamilyMembers familyMembers={family ?? []} />;

};