 
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Test connexion Firebase...');
        
    // Test: créer un document test
    const testRef = await addDoc(collection(db, 'test'), {
      message: 'Test Firebase connection',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Test document créé avec ID:', testRef.id);
        
    // Test: lire les documents
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('📄 Documents dans "test":', querySnapshot.size);
        
    querySnapshot.forEach((doc) => {
      console.log('📄 Document:', doc.id, '=>', doc.data());
    });
        
    return true;
  } catch (error) {
    console.error('❌ Test Firebase échoué:', error);
    return false;
  }
};