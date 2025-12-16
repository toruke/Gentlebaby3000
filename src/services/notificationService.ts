import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

interface CreateNotificationParams {
    familyId: string;
    sourceId: string;
    type: string;
    title: string;
    message: string;
}


export const createNotification = async ({
  familyId,
  sourceId,
  type,
  title,
  message,
}: CreateNotificationParams) => {
  return await addDoc(collection(db, 'notifications'), {
    familyId,
    sourceId,
    type,
    title,
    message,
    status: 'unread', // ✅ ALIGNÉ
    createdAt: Timestamp.now(),
  });
};

// 🔽 AJOUTÉS (manquants)
export const fetchFamilyNotifications = async (familyId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('familyId', '==', familyId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => ({
    notificationId: docSnap.id,
    ...docSnap.data(),
  }));
};

export const markNotificationAsRead = async (id: string) => {
  const ref = doc(db, 'notifications', id);
  await updateDoc(ref, { status: 'read' });
};
