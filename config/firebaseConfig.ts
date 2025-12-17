// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBQmxiRC5Ms4xjrk7nqkPS0h8_E0PgZmgU',
  authDomain: 'gentlebaby3000.firebaseapp.com',
  projectId: 'gentlebaby3000',
  storageBucket: 'gentlebaby3000.firebasestorage.app',
  messagingSenderId: '407754191563',
  appId: '1:407754191563:web:60f1b07393cd9276e8214e',
};
// Initialize Firebase

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: undefined,
});
export const storage = getStorage(app);