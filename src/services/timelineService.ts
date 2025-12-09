import { Task } from '../models/task';

export interface TimelineItem {
  id: string;
  task: Task;
  scheduledTime: Date;
  status: 'upcoming' | 'current' | 'overdue' | 'completed';
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  isNextUpcoming: boolean;
}

export class TimelineService {
  // Détermine la période de la journée
  static getPeriodOfDay(hour: number): TimelineItem['period'] {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  // Calcule le statut d'une tâche
  static calculateTaskStatus(
    task: Task,
    currentTime: Date,
    toleranceMinutes: number = 15,
  ): TimelineItem['status'] {
    if (task.Status === 'completed') return 'completed';

    if (!task.nextOccurrence) return 'upcoming';

    const taskTime = task.nextOccurrence instanceof Date 
      ? task.nextOccurrence 
      : new Date(task.nextOccurrence);
    
    const timeDiff = (taskTime.getTime() - currentTime.getTime()) / (1000 * 60); // en minutes

    if (timeDiff < 0) return 'overdue';
    if (timeDiff <= toleranceMinutes && timeDiff >= 0) return 'current';
    return 'upcoming';
  }

  // Organise les tâches en timeline
  static organizeTimeline(
    tasks: Task[],
    currentTime: Date = new Date(),
    toleranceMinutes: number = 15,
  ): TimelineItem[] {
    const timelineItems: TimelineItem[] = [];

    // Filtrer les tâches actives et non complétées
    const activeTasks = tasks.filter(task => 
      task.Active && task.Status !== 'completed',
    );

    // Trier par nextOccurrence
    const sortedTasks = [...activeTasks].sort((a, b) => {
      const timeA = a.nextOccurrence ? new Date(a.nextOccurrence).getTime() : Infinity;
      const timeB = b.nextOccurrence ? new Date(b.nextOccurrence).getTime() : Infinity;
      return timeA - timeB;
    });

    // Identifier la prochaine tâche à venir
    let foundNextUpcoming = false;

    sortedTasks.forEach((task) => {
      if (!task.nextOccurrence) return;

      const taskTime = new Date(task.nextOccurrence);
      const status = this.calculateTaskStatus(task, currentTime, toleranceMinutes);
      const period = this.getPeriodOfDay(taskTime.getHours());
      
      const timelineItem: TimelineItem = {
        id: `${task.id}_${taskTime.getTime()}`,
        task,
        scheduledTime: taskTime,
        status,
        period,
        isNextUpcoming: !foundNextUpcoming && status === 'upcoming',
      };

      // Marquer la première tâche upcoming comme "next"
      if (timelineItem.isNextUpcoming) {
        foundNextUpcoming = true;
      }

      timelineItems.push(timelineItem);
    });

    // Réorganiser: tâches en retard en premier, puis par ordre chronologique
    return timelineItems.sort((a, b) => {
      // Les tâches en retard toujours en premier
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      
      // Ensuite par ordre chronologique
      return a.scheduledTime.getTime() - b.scheduledTime.getTime();
    });
  }

  // Groupe les tâches par période
  static groupByPeriod(timelineItems: TimelineItem[]): Record<string, TimelineItem[]> {
    const grouped: Record<string, TimelineItem[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    timelineItems.forEach(item => {
      grouped[item.period].push(item);
    });

    // Filtrer les périodes vides
    Object.keys(grouped).forEach(period => {
      if (grouped[period].length === 0) {
        delete grouped[period];
      }
    });

    return grouped;
  }

  // Formatte l'heure pour l'affichage
  static formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
    });
  }

  // Obtient le libellé de la période
  static getPeriodLabel(period: TimelineItem['period']): string {
    const labels = {
      morning: '🌅 Matin',
      afternoon: '☀️ Après-midi',
      evening: '🌙 Soir',
      night: '🌌 Nuit',
    };
    return labels[period];
  }

  // Obtient la couleur selon le statut
  static getStatusColor(status: TimelineItem['status'], isNextUpcoming: boolean): string {
    if (status === 'overdue') return '#dc3545'; // Rouge
    if (status === 'current') return '#fd7e14'; // Orange
    if (isNextUpcoming) return '#28a745'; // Vert pour la prochaine
    return '#6c757d'; // Gris par défaut
  }
}