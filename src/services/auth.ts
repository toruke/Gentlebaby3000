
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

export async function signUp(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export const getCurrentUser = async () => {
  const token = await AsyncStorage.getItem('token');
  return token ? { token } : null;
};

export async function logout() {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Erreur logout:', error);
    throw error;
  }
}