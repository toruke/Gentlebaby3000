// src/services/planning.ts
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
  } from 'firebase/firestore';
  import { db } from '../../config/firebaseConfig';
  import { PlanningSlot } from '../models/planning';
  
  type GetPlanningParams = {
    familyId: string;
    from: Date;
    to: Date;
    memberId?: string; // optionnel pour filtrer par membre
  };
  
  export async function getPlanningSlots({
    familyId,
    from,
    to,
    memberId,
  }: GetPlanningParams): Promise<PlanningSlot[]> {
    const colRef = collection(db, 'plannings');
  
    const constraints: any[] = [
      where('familyId', '==', familyId),
      where('startTime', '>=', Timestamp.fromDate(from)),
      where('startTime', '<', Timestamp.fromDate(to)),
      orderBy('startTime', 'asc'),
    ];
  
    if (memberId) {
      constraints.push(where('memberId', '==', memberId));
    }
  
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
  
    const slots: PlanningSlot[] = snapshot.docs.map((doc) => {
      const data = doc.data() as any;
  
      return {
        planningId: doc.id,
        familyId: data.familyId,
        memberId: data.memberId,
        firstName: data.firstName,
        lastName: data.lastName,
        startTime: (data.startTime as Timestamp).toDate(),
        endTime: (data.endTime as Timestamp).toDate(),
      };
    });
  
    return slots;
  }
  