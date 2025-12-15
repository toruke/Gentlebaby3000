import { useEffect, useState, useMemo } from 'react';
import { Task } from '../models/task';
import { taskService } from '../services/taskService';

export const useFamilyTasks = (familyId: string | string[]) => { // J'ai adapté le type car vous vérifiez isArray
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. On normalise l'ID dès le début pour l'utiliser partout
  const normalizedId = useMemo(() => {
    if (Array.isArray(familyId)) return familyId[0];
    if (typeof familyId === 'number') return String(familyId);
    return familyId;
  }, [familyId]);

  useEffect(() => {


    // Vérifications de sécurité
    if (!normalizedId || normalizedId === 'undefined' || normalizedId === 'null') {
      console.warn('⚠️ useFamilyTasks - ID invalide, arrêt du chargement');
      setLoading(false);
      setError('ID de famille invalide');
      return;
    }

    if (normalizedId.length < 3) {
      console.warn('⚠️ useFamilyTasks - ID semble trop court:', normalizedId);
    }

    setLoading(true);
    setError(null);

    // CORRECTION 2 : La souscription est bien À L'INTÉRIEUR du useEffect
    const unsubscribe = taskService.subscribeToFamilyTasks(
      normalizedId,
      (tasksList) => {
        setTasks(tasksList);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => { // Renommé 'error' en 'err' pour éviter conflit avec le state 'error'
        console.error('❌ Erreur useFamilyTasks:', err);
        setError(err.message);
        setLoading(false);
        setRefreshing(false);
      },
    );

    // CORRECTION 3 : Le nettoyage est bien retourné par le useEffect
    return () => {
      unsubscribe();
    };
  }, [normalizedId]); // On dépend de l'ID normalisé

  const refresh = () => {
    setRefreshing(true);
    // Comme c'est un listener temps réel, on a juste besoin de resetter l'état visuel
    // ou de re-vérifier la connexion, mais ici on simule juste un petit délai
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Méthodes pour manipuler les tâches
  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!normalizedId) return false;

    try {
      await taskService.deleteTask(normalizedId, taskId);
      return true;
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      throw err;
    }
  };

  const toggleActive = async (taskId: string, currentActive: boolean): Promise<void> => {
    if (!normalizedId) return;
    await taskService.toggleTaskActive(normalizedId, taskId, currentActive);
  };

  const markComplete = async (taskId: string): Promise<void> => {
    if (!normalizedId) return;
    await taskService.updateTaskStatus(normalizedId, taskId, 'completed');
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