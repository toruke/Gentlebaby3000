import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Task } from '../models/task';

// 🔁 Helper de conversion
const toTimestamp = (date?: Date) =>
  date ? Timestamp.fromDate(date) : undefined;

export const taskService = {
  subscribeToFamilyTasks: (
    familyId: string,
    callback: (tasks: Task[]) => void,
    errorCallback: (error: Error) => void,
  ) => {
    const tasksRef = collection(db, 'family', familyId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
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

  // ✅ CONTRAT CORRECT
  createTask: async (
    familyId: string,
    taskData: {
      startDateTime?: Date;
      nextOccurrence?: Date;
    } & Omit<Task, 'id' | 'createdAt' | 'startDateTime' | 'nextOccurrence'>,
  ): Promise<string> => {

    const firestoreTask: Omit<Task, 'id'> = {
      ...taskData,
      startDateTime: toTimestamp(taskData.startDateTime),
      nextOccurrence: toTimestamp(taskData.nextOccurrence),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, 'family', familyId, 'tasks'),
      firestoreTask,
    );

    return docRef.id;
  },

  deleteTask: async (familyId: string, taskId: string): Promise<void> => {
    await deleteDoc(doc(db, 'family', familyId, 'tasks', taskId));
  },

  updateTaskStatus: async (
    familyId: string,
    taskId: string,
    status: Task['Status'],
  ): Promise<void> => {
    await updateDoc(
      doc(db, 'family', familyId, 'tasks', taskId),
      { Status: status },
    );
  },

  toggleTaskActive: async (
    familyId: string,
    taskId: string,
    currentActive: boolean,
  ): Promise<void> => {
    await updateDoc(
      doc(db, 'family', familyId, 'tasks', taskId),
      { Active: !currentActive },
    );
  },
};