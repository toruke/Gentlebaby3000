import { useLocalSearchParams } from 'expo-router';
import ActivityScreen from '../../../../../src/screens/family/familyActivityScreen';

export default function ActivityScreenWrapper() {
  const params = useLocalSearchParams();

  // Essayez toutes les clés possibles
  const familyId = params.familyId || params.id;


  // Si c'est un tableau, prenez le premier élément
  const effectiveFamilyId = Array.isArray(familyId) ? familyId[0] : familyId;


  // Passez l'ID comme prop
  return <ActivityScreen familyId={effectiveFamilyId} />;
}