import { useEffect, useState } from 'react';
import { Task } from '../models/task';
import { taskService } from '../services/taskService';

export const useFamilyTasks = (familyId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎯 useFamilyTasks - Nouvel appel avec:', {
      familyId,
      type: typeof familyId,
      isArray: Array.isArray(familyId),
    });

    // Normaliser l'ID
    let normalizedId: string | null = null;
    
    if (Array.isArray(familyId)) {
      normalizedId = familyId[0]; // Prendre le premier élément
    } else if (typeof familyId === 'string') {
      normalizedId = familyId;
    } else if (typeof familyId === 'number') {
      normalizedId = String(familyId);
    }
    
    console.log('🎯 useFamilyTasks - ID normalisé:', normalizedId);

    // Vérifications
    if (!normalizedId || normalizedId === 'undefined' || normalizedId === 'null') {
      console.warn('⚠️ useFamilyTasks - ID invalide, arrêt du chargement');
      setLoading(false);
      setError('ID de famille invalide');
      return;
    }

    if (normalizedId.length < 3) { // Les IDs Firestore font généralement 20+ caractères
      console.warn('⚠️ useFamilyTasks - ID semble trop court:', normalizedId);
    }

    console.log(`🔄 Début du chargement pour famille: ${normalizedId}`);
    setLoading(true);
    setError(null);

    const unsubscribe = taskService.subscribeToFamilyTasks(
      normalizedId,
      (tasksList) => {
        console.log(`✅ ${tasksList.length} tâche(s) chargée(s)`);
        setTasks(tasksList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('❌ Erreur useFamilyTasks:', error);
        setError(error.message);
        setLoading(false);
        setRefreshing(false);
      },
    );

    return () => {
      console.log('🧹 Nettoyage useFamilyTasks');
      unsubscribe();
    };
  }, [familyId]); // Dépendance sur familyId
  const refresh = () => {
    console.log('🔄 Manuel refresh déclenché');
    setRefreshing(true);
    // Le useEffect se déclenchera à nouveau car refreshing change
  };

  // Méthodes pour manipuler les tâches
  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!familyId) return false;
    
    const id = Array.isArray(familyId) ? familyId[0] : familyId;
    try {
      await taskService.deleteTask(id, taskId);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      throw error;
    }
  };

  const toggleActive = async (taskId: string, currentActive: boolean): Promise<void> => {
    if (!familyId) return;
    
    const id = Array.isArray(familyId) ? familyId[0] : familyId;
    await taskService.toggleTaskActive(id, taskId, currentActive);
  };

  const markComplete = async (taskId: string): Promise<void> => {
    if (!familyId) return;
    
    const id = Array.isArray(familyId) ? familyId[0] : familyId;
    await taskService.updateTaskStatus(id, taskId, 'completed');
  };

  return {
    tasks,
    loading,
    refreshing,
    error,
    refresh,
    deleteTask,
    toggleActive,
    markComplete,
  };
};