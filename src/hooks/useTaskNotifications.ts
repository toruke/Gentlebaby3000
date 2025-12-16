import { useEffect, useRef } from 'react';
import { Task } from '../models/task';
import { createNotification } from '../services/notificationService';

type NotifiedMap = {
    start: Set<string>;
    late: Set<string>;
};

export const useTaskNotifications = (
  familyId: string | undefined,
  tasks: Task[],
) => {
  // Empêche les notifications multiples pendant la session
  const notifiedRef = useRef<NotifiedMap>({
    start: new Set(),
    late: new Set(),
  });

  useEffect(() => {
    if (!familyId || tasks.length === 0) return;

    const now = new Date();

    tasks.forEach((task) => {
      if (!task.nextOccurrence) return;
      if (task.Status !== 'pending') return;

      const next = new Date(task.nextOccurrence);

      /* ===============================
                                     ⏰ DÉBUT DE TÂCHE
                                 ===============================
                                 ❌ Désactivé volontairement
                                 (on ne notifie PAS au début de tâche)
                              */
      // if (
      //     next <= now &&
      //     !notifiedRef.current.start.has(task.id)
      // ) {
      //     createNotification({
      //         familyId,
      //         sourceId: task.id,
      //         type: 'task_start',
      //         title: '⏰ Début de tâche',
      //         message: `Il est temps de commencer : ${task.Name}`,
      //     });
      //
      //     notifiedRef.current.start.add(task.id);
      // }

      /* ===============================
                                     ⚠️ TÂCHE EN RETARD
                                 =============================== */
      const toleranceMs = (task.Tolerance ?? 0) * 60 * 60 * 1000;
      const lateDate = new Date(next.getTime() + toleranceMs);

      if (
        now > lateDate &&
                !notifiedRef.current.late.has(task.id)
      ) {
        createNotification({
          familyId,
          sourceId: task.id,
          type: 'task_late',
          title: '⚠️ Tâche en retard',
          message: `La tâche "${task.Name}" est en retard`,
        });

        notifiedRef.current.late.add(task.id);
      }
    });
  }, [familyId, tasks]);
};
