import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { FamilyMember, Device } from '../components/FamilyMember'; // On utilise les types de l'UI

export const useFamilyManagement = (familyId: string | undefined) => {
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchFamilyData = useCallback(async (currentFamilyId: string) => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Récupérer tous les membres
      const membersRef = collection(db, 'family', currentFamilyId, 'members');
      const snapshot = await getDocs(membersRef);

      // 2. Pour chaque membre, aller chercher son appareil SI il en a un
      const membersWithDevices = await Promise.all(snapshot.docs.map(async (memberDoc) => {
        const memberData = memberDoc.data();
        let fullDeviceData: Device | undefined = undefined;

        // Le champ dans la DB s'appelle 'devices' (string) contenant le serialNumber
        const deviceSerial = memberData.devices; 

        if (deviceSerial) {
          try {
            // On va chercher les détails dans la sous-collection 'devices'
            const deviceDocRef = doc(db, 'family', currentFamilyId, 'devices', deviceSerial);
            const deviceSnap = await getDoc(deviceDocRef);
            
            if (deviceSnap.exists()) {
              const data = deviceSnap.data();
              // On formate les dates Firestore pour l'affichage
              fullDeviceData = {
                id: deviceSnap.id,
                serialNumber: data.serialNumber,
                type: data.type, // 'EMITTER' ou 'RECEIVER'
                status: data.status,
                // Gestion sécurisée des dates
                pairedAt: data.pairedAt?.toDate ? data.pairedAt.toDate().toLocaleDateString() : 'N/A',
                lastSeen: data.lastSeen?.toDate ? data.lastSeen.toDate().toLocaleString() : 'N/A',
              };
            }
          } catch (e) {
            console.warn('Erreur chargement device pour membre', memberDoc.id, e);
          }
        }

        // On retourne l'objet complet formaté pour l'UI
        return {
          idUser: memberDoc.id, // L'ID du document est l'ID User
          idFamily: currentFamilyId,
          name: memberData.displayName || 'Membre',
          role: memberData.role,
          avatar: memberData.photoUrl || '',
          device: fullDeviceData, // Ici on a l'objet complet, pas juste l'ID
        };
      }));

      setFamily(membersWithDevices);

    } catch (err) {
      console.error('Erreur chargement famille:', err);
      setError('Impossible de charger les données de la famille.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (familyId) {
        fetchFamilyData(familyId);
      }
    }, [familyId, fetchFamilyData]),
  );

  return { family, loading, error, refresh: () => familyId && fetchFamilyData(familyId) };
};