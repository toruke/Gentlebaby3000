import { collection, where, getDocs, getDoc, doc, query } from 'firebase/firestore';
//import { db, auth } from '@/config/firebaseConfig';
import { db } from '@/config/firebaseConfig';
import { Device, FamilyMember } from '../components/FamilyMember';

const MEMBERBERSHIP_COLLECTION = 'memberShip';
const USERS_COLLECTION = 'user';
const DEVICE_COLLECTION = 'device';

// !!!!!! A SUPPRIMER
const currentUser = { uid: 'XyDTfApw8wbPL6OOn2sT2jqmPkv1', email: 'maggie.remy@gmail.com'};

export async function getFamilyService(): Promise<FamilyMember[]> {
  //connected user verification 
  //const user = auth.currentUser;
  const user = currentUser;

  if (!user) throw new Error('Utilisateur non connecté');


  try {
    //family for this user where is tuteur
    const membersShip = query(
      collection(db, MEMBERBERSHIP_COLLECTION),
      where('userId', '==', user.uid), 
      where('role', '==', 'Tuteur'));
    const snap = await getDocs(membersShip);
    if (snap.empty) {
      return [];}
    
    const familyMembers : FamilyMember[] = [];

    //members for this family
    for (const membershipDoc of snap.docs) {
      const {familyId} = membershipDoc.data();
      
      const familyQuery = query(
        collection(db, MEMBERBERSHIP_COLLECTION),
        where ('familyId', '==', familyId));
      const snapMembers = await getDocs(familyQuery);
      for (const memberDoc of snapMembers.docs) {
        const memberData= memberDoc.data();
        //information user
        const userSnap = await getDoc(doc(db, USERS_COLLECTION, memberData.userId));
        const userData = userSnap.data();

        //device for this user
        const deviceQuery = query(
          collection(db, DEVICE_COLLECTION),
          where('userId', '==', memberData.userId),
        );
        const deviceSnap = await getDocs(deviceQuery);
        const deviceData = !deviceSnap.empty ? deviceSnap.docs[0].data() : undefined;

        const device: Device | undefined = deviceData
          ? {
            id: deviceSnap.docs[0].id,
            serialNumber: deviceData.serialNumber,
            type: deviceData.type,
            status: deviceData.status,
            pairedAt: deviceData.pairedAt.toDate().toLocaleString('fr-FR', { timeZone: 'Europe/Brussels' }),
            lastSeen: deviceData.lastSeen.toDate().toLocaleString('fr-FR', 
              { timeZone: 'Europe/Brussels', 
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
          }
          : undefined;

        familyMembers.push({
          id: memberData.userId,
          name: userData?.firstName + ' ' + userData?.lastName,
          role: memberData.role,
          device,
        });
      }
    }
    // eslint-disable-next-line no-console
    console.table(familyMembers);

    return familyMembers;
  }

  catch(error){
    // eslint-disable-next-line no-console
    console.error(error);
    return [];  }
};