import firestore from '@react-native-firebase/firestore';

/**
 * Service gérant toutes les opérations liées aux tâches
 */
export class TaskService {
  private static COLLECTION = 'tasks';
  private static OCCURRENCES_COLLECTION = 'taskOccurrences';

  /**
   * Suppression soft delete d'une tâche
   * @param taskId - ID de la tâche à supprimer
   * @returns Promise<void>
   */
  static async softDeleteTask(taskId: string): Promise<void> {
    try {
      await firestore()
        .collection(this.COLLECTION)
        .doc(taskId)
        .update({
          deleted_at: firestore.FieldValue.serverTimestamp(),
          Active: false,
          Status: 'deleted',
        });

      // Nettoyage en cascade des occurrences futures
      await this.deleteTaskOccurrences(taskId);
    } catch (error) {
      console.error('Erreur lors du soft delete:', error);
      throw new Error('Impossible de supprimer la tâche');
    }
  }

  /**
   * Suppression physique définitive d'une tâche (hard delete)
   * @param taskId - ID de la tâche à supprimer définitivement
   * @returns Promise<void>
   */
  static async hardDeleteTask(taskId: string): Promise<void> {
    try {
      // 1. Supprimer les occurrences liées
      await this.deleteTaskOccurrences(taskId);

      // 2. Suppression physique du document
      await firestore()
        .collection(this.COLLECTION)
        .doc(taskId)
        .delete();
    } catch (error) {
      console.error('Erreur lors du hard delete:', error);
      throw new Error('Impossible de supprimer définitivement la tâche');
    }
  }

  /**
   * Supprime toutes les occurrences futures d'une tâche
   * Conservation de l'historique des validations passées
   * @param taskId - ID de la tâche
   * @returns Promise<void>
   */
  static async deleteTaskOccurrences(taskId: string): Promise<void> {
    try {
      const occurrencesSnapshot = await firestore()
        .collection(this.OCCURRENCES_COLLECTION)
        .where('taskId', '==', taskId)
        .where('completedAt', '==', null) // Seulement les occurrences non-complétées
        .get();

      if (occurrencesSnapshot.empty) {
        console.log('Aucune occurrence future à supprimer');
        return;
      }

      // Batch delete pour performance (max 500 documents par batch)
      const batch = firestore().batch();

      occurrencesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`${occurrencesSnapshot.size} occurrence(s) future(s) supprimée(s)`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des occurrences:', error);
      // Ne pas bloquer la suppression principale si échec
      throw error;
    }
  }

  /**
   * Récupère toutes les tâches actives (non supprimées)
   * @returns Query Firestore
   */
  static getActiveTasks() {
    return firestore()
      .collection(this.COLLECTION)
      .where('deleted_at', '==', null)
      .orderBy('createdAt', 'desc');
  }

  /**
   * Restaure une tâche supprimée (annuler soft delete)
   * @param taskId - ID de la tâche à restaurer
   * @returns Promise<void>
   */
  static async restoreTask(taskId: string): Promise<void> {
    try {
      await firestore()
        .collection(this.COLLECTION)
        .doc(taskId)
        .update({
          deleted_at: null,
          Active: true,
          Status: 'pending',
        });
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      throw new Error('Impossible de restaurer la tâche');
    }
  }

  /**
   * Récupère les tâches supprimées (corbeille)
   * @returns Query Firestore
   */
  static getDeletedTasks() {
    return firestore()
      .collection(this.COLLECTION)
      .where('deleted_at', '!=', null)
      .orderBy('deleted_at', 'desc');
  }
}

export default TaskService;
