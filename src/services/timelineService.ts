import { Timestamp } from 'firebase/firestore';
import { Task } from '../models/task';

// Définition des périodes possibles pour réutilisation
export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimelineItem {
  id: string;
  task: Task;
  scheduledTime: Date;
  status: 'upcoming' | 'current' | 'overdue' | 'completed';
  period: DayPeriod;
  isNextUpcoming: boolean;
}

// Type personnalisé pour l'entrée de date (plus sûr que 'any')
// Accepte : Date JS, Timestamp Firestore, Objet brut {seconds}, string ISO, ou nombre (ms)
type DateInput = Date | Timestamp | { seconds: number, nanoseconds?: number } | string | number | null | undefined;

export class TimelineService {
  
  // Convertit divers formats de date en objet Date JS valide
  static toJsDate(dateInput: DateInput): Date {
    if (!dateInput) return new Date(); // Fallback "Maintenant"

    if (dateInput instanceof Date) return dateInput;

    // Vérification sécurisée pour Timestamp Firestore (méthode .toDate())
    // On utilise "in" ou un check de type pour rassurer TypeScript
    if (typeof (dateInput as { toDate?: unknown }).toDate === 'function') {
      return (dateInput as Timestamp).toDate();
    }

    // Vérification sécurisée pour un objet brut { seconds: ... }
    if (typeof dateInput === 'object' && 'seconds' in dateInput && typeof (dateInput as { seconds: unknown }).seconds === 'number') {
      return new Date((dateInput as { seconds: number }).seconds * 1000);
    }

    // Fallback pour string ou number
    return new Date(dateInput as string | number);
  }

  // Détermine la période de la journée
  static getPeriodOfDay(hour: number): DayPeriod {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  // --- : Calcul de la prochaine occurrence ---
  static getNextOccurrenceForTimeline(task: Task, currentTime: Date): Date | null {
    // 1. Tâche Temporelle (Heures Fixes : "08:00", "14:00")
    if (task.Type === 'temporal' && task.fixedTimes && task.fixedTimes.length > 0) {
      // Trier les heures
      const times = [...task.fixedTimes].sort();
      const now = new Date(currentTime);
      
      for (const timeStr of times) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const candidate = new Date(now);
        candidate.setHours(hours, minutes, 0, 0);

        // Si cette heure est dans le futur (ou très proche dans le passé selon tolérance)
        // Ici on prend strictement > currentTime - 1h pour afficher ce qui vient de se passer
        if (candidate.getTime() > now.getTime() - (60 * 60 * 1000)) { 
          return candidate;
        }
      }
      
      // Si aucune heure trouvée aujourd'hui, prendre la première de demain
      const [hours, minutes] = times[0].split(':').map(Number);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hours, minutes, 0, 0);
      return tomorrow;
    }

    // 2. Tâche Récurrente
    if (task.Type === 'recurring' && task.nextOccurrence) {
      return this.toJsDate(task.nextOccurrence);
    }

    // 3. Événement unique
    if (task.Type === 'event' && task.startDateTime) {
      return this.toJsDate(task.startDateTime);
    }

    return null;
  }

  // Calcule le statut d'une tâche
  static calculateTaskStatus(
    scheduledTime: Date,
    currentTime: Date,
    toleranceMinutes: number = 15,
  ): TimelineItem['status'] {
    const diffInMinutes = (scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60);

    if (diffInMinutes < -toleranceMinutes) return 'overdue'; // Passé de X min
    if (diffInMinutes <= toleranceMinutes) return 'current'; // Entre maintenant et +X min
    return 'upcoming'; // Futur lointain
  }

  // Organise les tâches en timeline
  static organizeTimeline(
    tasks: Task[],
    currentTime: Date = new Date(),
    toleranceMinutes: number = 15,
  ): TimelineItem[] {
    const timelineItems: TimelineItem[] = [];
    let foundNextUpcoming = false;

    tasks.forEach((task) => {
      // Ignorer les inactives ou terminées
      if (!task.Active || task.Status === 'completed') return;

      // CALCULER LA DATE D'AFFICHAGE RÉELLE
      const displayDate = this.getNextOccurrenceForTimeline(task, currentTime);

      if (!displayDate) return;

      // On ne garde que ce qui est pertinent (24h en arrière max)
      const isRelevant = displayDate.getTime() > (currentTime.getTime() - 24 * 60 * 60 * 1000);

      if (isRelevant) {
        const status = this.calculateTaskStatus(displayDate, currentTime, toleranceMinutes);
        const period = this.getPeriodOfDay(displayDate.getHours());

        const uniqueId = `${task.id}_${displayDate.getTime()}`;

        timelineItems.push({
          id: uniqueId,
          task,
          scheduledTime: displayDate,
          status,
          period,
          isNextUpcoming: false, // On calcule après le tri
        });
      }
    });

    // TRI : Retards d'abord, puis chronologique
    const sortedItems = timelineItems.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return a.scheduledTime.getTime() - b.scheduledTime.getTime();
    });

    // Marquer le "Prochain" élément
    for (const item of sortedItems) {
      if (item.status === 'upcoming' || item.status === 'current') {
        item.isNextUpcoming = !foundNextUpcoming;
        if (!foundNextUpcoming) foundNextUpcoming = true;
      }
    }

    return sortedItems;
  }

  // Groupe les tâches par période
  // Record<string...> est utilisé car les clés d'objets sont toujours des strings en JS
  static groupByPeriod(timelineItems: TimelineItem[]): Record<string, TimelineItem[]> {
    const grouped: Record<string, TimelineItem[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    timelineItems.forEach(item => {
      if (grouped[item.period]) {
        grouped[item.period].push(item);
      }
    });

    // Nettoyage des clés vides
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) delete grouped[key];
    });

    return grouped;
  }

  // Formatte l'heure pour l'affichage
  static formatTime(date: Date): string {
    if (!date || isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
    });
  }

  // Accepte string générique car cela peut venir de la BDD ou d'ailleurs
  static getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      morning: '🌅 Matin (05h - 12h)',
      afternoon: '☀️ Après-midi (12h - 18h)',
      evening: '🌙 Soir (18h - 22h)',
      night: '🌌 Nuit (22h - 05h)',
    };
    return labels[period] || period;
  }

  static getStatusColor(status: TimelineItem['status'] | string, isNextUpcoming: boolean): string {
    if (status === 'overdue') return '#dc3545'; // Rouge
    if (status === 'current') return '#fd7e14'; // Orange
    if (isNextUpcoming) return '#28a745'; // Vert
    return '#6c757d'; // Gris
  }
}