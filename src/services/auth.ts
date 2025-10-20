
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

export async function signUp(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}
