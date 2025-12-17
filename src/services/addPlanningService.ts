import { addDoc, collection, getDocs, query, Timestamp, where, DocumentData } from 'firebase/firestore'; // ✅ Import DocumentData
import { db } from '../../config/firebaseConfig';
import { PlanningSlot } from '../models/planning';

export const addPlanningService = {
  async getPlanningSlots(familyId: string): Promise<PlanningSlot[]> {
    if (!familyId) throw new Error('familyId is required');

    const q = query(collection(db, 'plannings'), where('familyId', '==', familyId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      // ✅ Correction du 'as any' par 'as DocumentData' ou typage inline
      const d = doc.data() as DocumentData; 
      
      return {
        planningId: doc.id,
        familyId: d.familyId,
        memberId: d.memberId,
        firstName: d.firstName,
        lastName: d.lastName,
        startTime: d.startTime?.toDate() ?? new Date(),
        endTime: d.endTime?.toDate() ?? new Date(),
      };
    });
  },

  async addPlanningSlot(
    familyId: string,
    memberId: string,
    firstName: string,
    lastName: string,
    startTime: Date,
    endTime: Date,
  ) {
    if (!familyId || !memberId) throw new Error('familyId and memberId are required');

    return addDoc(collection(db, 'plannings'), {
      familyId,
      memberId,
      firstName,
      lastName,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      status: 'planned',
    });
  },
};

