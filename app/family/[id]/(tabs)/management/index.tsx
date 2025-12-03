import ManagementScreen from '@/src/screens/family/familyManagementScreen';
import { useLocalSearchParams } from 'expo-router';

// Wrapper pour passer les params
export default function ManagementScreenWrapper() {
  const params = useLocalSearchParams();
  const familyId = params.familyId || params.id;
  
  const resolvedFamilyId: string | undefined = Array.isArray(familyId)
    ? familyId[0] // Prend le premier élément du tableau
    : (typeof familyId === 'string' ? familyId : undefined); // Prend la chaîne ou undefined

  // 3. Passez-le comme une prop nommée, typée correctement.
  return <ManagementScreen familyId={resolvedFamilyId} />;
}