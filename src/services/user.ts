import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export async function upsertUser({ userId, firstName, lastName, email }: {
    userId: string; firstName: string; lastName: string; email: string;
}) {
  await setDoc(doc(db, 'user', userId), {
    firstName, lastName, email, createdAt: serverTimestamp(),
  }, { merge: true });
}
