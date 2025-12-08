// src/services/planning.ts
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { PlanningSlot } from '../models/planning';

type GetPlanningParams = {
  familyId: string;
  from: Date;
  to: Date;
  memberId?: string;
};

// 👇 nouveau type : tel que stocké dans Firestore
type FirestorePlanningSlot = {
  familyId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  startTime: Timestamp; // ← Timestamp Firestore
  endTime: Timestamp;   // ← Timestamp Firestore
};

export async function getPlanningSlots({
  familyId,
  from,
  to,
  memberId,
}: GetPlanningParams): Promise<PlanningSlot[]> {
  const colRef = collection(db, 'plannings');

  const constraints: QueryConstraint[] = [
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
    const data = doc.data() as FirestorePlanningSlot; // 👈 plus de `any` ni de cast bizarre

    return {
      planningId: doc.id,
      familyId: data.familyId,
      memberId: data.memberId,
      firstName: data.firstName,
      lastName: data.lastName,
      // ici on convertit proprement Timestamp → Date
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
    };
  });

  return slots;
}
