// src/services/taskService.ts
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
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Task } from '../models/task';

// --- DEFINITION DES TYPES ---

// 1. On définit ce que le Service attend en entrée (DTO - Data Transfer Object)
// On prend tout 'Task', on enlève les champs générés (id, createdAt) 
// et on redéfinit les dates pour accepter du JS 'Date' au lieu de 'Timestamp'
export type CreateTaskPayload = Omit<Task, 'id' | 'createdAt' | 'startDateTime' | 'nextOccurrence'> & {
  startDateTime?: Date | null;
  nextOccurrence?: Date | null;
};

// 2. Helper de conversion typé
const toTimestamp = (date?: Date | Timestamp | null): Timestamp | null => {
  if (!date) return null;
  if (date instanceof Timestamp) return date;
  return Timestamp.fromDate(date);
};

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

  // ✅ FONCTION TYPÉE (Plus de any)
  createTask: async (
    familyId: string,
    taskData: CreateTaskPayload, 
  ): Promise<string> => {
    try {
      // 1. On sépare les dates du reste pour les convertir proprement
      const { startDateTime, nextOccurrence, ...rest } = taskData;

      // 2. On construit l'objet brut avec les Timestamps
      // Record<string, unknown> permet de manipuler les clés dynamiquement sans 'any'
      const rawPayload: Record<string, unknown> = {
        ...rest,
        startDateTime: toTimestamp(startDateTime) ?? null,
        nextOccurrence: toTimestamp(nextOccurrence) ?? null,
        createdAt: Timestamp.now(),
      };

      // 3. NETTOYAGE (Type-safe)
      // On recrée un objet en filtrant ceux qui sont undefined
      const cleanPayload = Object.entries(rawPayload).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as DocumentData); // On dit à TS que le résultat est compatible Firestore

      console.log('📤 Envoi propre à Firestore:', JSON.stringify(cleanPayload, null, 2));

      const docRef = await addDoc(
        collection(db, 'family', familyId, 'tasks'),
        cleanPayload,
      );

      return docRef.id;

    } catch (error) {
      console.error('🔥 Erreur dans taskService:', error);
      throw error;
    }
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