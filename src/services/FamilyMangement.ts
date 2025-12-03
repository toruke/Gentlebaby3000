import { collection, where, getDocs, getDoc, doc, query } from 'firebase/firestore';
//import { db, auth } from '@/config/firebaseConfig';
import { db } from '@/config/firebaseConfig';
import { Device, FamilyMember } from '../components/FamilyMember';
import { getCurrentAuthUser } from './auth';

const USERS_COLLECTION = 'user';
const DEVICE_COLLECTION = 'device';
const FAMILY_COLLECTION = 'family';


export async function getFamilySelectedService(id: string): Promise<FamilyMember[]> {
  getCurrentAuthUser();

  try {
    
    const familyMembers : FamilyMember[] = [];
    
    //members for this family
    const memberQuery = query(
      collection(db, FAMILY_COLLECTION, id, 'members'));
    const snapMembers = await getDocs(memberQuery);
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
        idUser: memberData.userId,
        idFamily: id,
        name: userData?.firstName + ' ' + userData?.lastName,
        role: memberData.role,
        device,
      });
    }

    //children for this family
    const BabieQuery = query(
      collection(db, FAMILY_COLLECTION, id, 'children'));
    const snapChildren = await getDocs(BabieQuery);
    for (const childrenDoc of snapChildren.docs) {
      const ChildrenData= childrenDoc.data();
    

      //device for this user
      const deviceQuery = query(
        collection(db, DEVICE_COLLECTION),
        where('userId', '==', ChildrenData.id),
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
        idUser: ChildrenData.id,
        idFamily: id,
        name: ChildrenData?.firstName + ' ' + ChildrenData?.lastName,
        role: 'enfant',
        device,
      });
    }
  
    return familyMembers;
      
  }

  catch(error){
    console.error(error);
    return [];  }
};