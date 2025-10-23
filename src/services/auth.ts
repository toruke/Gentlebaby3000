
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function signUp(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export const getCurrentUser = async () => {
  const token = await AsyncStorage.getItem('token');
  return token ? { token } : null;
};

