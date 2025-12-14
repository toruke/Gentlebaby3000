

import { Text, View } from 'react-native';
import { FamilyMembers } from '../../components/FamilyMember';
import { useFamilyManagement } from '../../hooks/useFamilyManagement';
import { stylesFamily } from '../../styles/FamilyManagementStyle';
interface FamilyManagementProps {
  familyId: string | undefined;
}

export default function FamilyManagement({ familyId }: FamilyManagementProps) {
  const { family, loading, error } = useFamilyManagement(familyId);

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
