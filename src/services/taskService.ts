import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Task } from '../models/task';

export const taskService = {
  // Écouter les tâches d'une famille
  subscribeToFamilyTasks: (
    familyId: string,
    callback: (tasks: Task[]) => void,
    errorCallback: (error: Error) => void,
  ) => {
    const tasksRef = collection(db, 'family', familyId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data(),
          } as Task);
        });
        callback(tasks);
      },
      errorCallback,
    );
  },
  // Créer une nouvelle tâche
  createTask: async (familyId: string, taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
    const tasksRef = collection(db, 'family', familyId, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: Timestamp.now(), // Utilise le timestamp du serveur
    });
    return docRef.id;
  },

  // Supprimer une tâche
  deleteTask: async (familyId: string, taskId: string): Promise<void> => {
    const taskRef = doc(db, 'family', familyId, 'tasks', taskId);
    await deleteDoc(taskRef);
  },

  // Mettre à jour le statut
  updateTaskStatus: async (familyId: string, taskId: string, status: Task['Status']): Promise<void> => {
    const taskRef = doc(db, 'family', familyId, 'tasks', taskId);
    await updateDoc(taskRef, { Status: status });
  },

  // Basculer l'état actif/inactif
  toggleTaskActive: async (familyId: string, taskId: string, currentActive: boolean): Promise<void> => {
    const taskRef = doc(db, 'family', familyId, 'tasks', taskId);
    await updateDoc(taskRef, { Active: !currentActive });
  },
};