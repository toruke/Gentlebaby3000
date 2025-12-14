import { TimelineService, TimelineItem } from '../../../src/services/timelineService';
import { Task, TaskType } from '../../../src/models/task';
import { Timestamp } from 'firebase/firestore';

// --- CONSTANTE GLOBALE ---
const REF_DATE = new Date('2024-05-10T10:00:00Z');

// 1. DÉFINITION D'UNE TÂCHE DE BASE VALIDE
// Cela permet de satisfaire TypeScript qui exige tous les champs de l'interface Task
const BASE_TASK: Task = {
  id: 'base_id',
  Name: 'Base Task',
  Icon: '📝',
  Type: 'recurring',
  Active: true,
  Status: 'pending',
  Tolerance: 15,
  Validation: false,
  assignedMembers: [],
  // On mocke le Timestamp Firebase proprement via un cast partiel si nécessaire
  // ou en créant un objet qui ressemble à un Timestamp
  createdAt: { seconds: 1700000000, nanoseconds: 0 } as unknown as Timestamp,
};

// --- MOCK DATA ---
const MOCK_TASKS: Task[] = [
  {
    ...BASE_TASK,
    id: 't1',
    Name: 'Biberon',
    Icon: '🍼',
    Type: 'recurring',
    nextOccurrence: new Date('2024-05-10T09:30:00Z'),
  },
  {
    ...BASE_TASK,
    id: 't2',
    Name: 'Sieste',
    Icon: '🛏️',
    Type: 'temporal',
    fixedTimes: ['14:00', '20:00'],
  },
];

describe('TimelineService', () => {
  
  describe('toJsDate', () => {
    it('converts Firestore Timestamp to Date', () => {
      // On simule un objet qui a la méthode toDate (interface partielle)
      const timestamp = { 
        seconds: 1715335200, 
        nanoseconds: 0, 
        toDate: () => new Date('2024-05-10T10:00:00Z'), 
      };
      const date = TimelineService.toJsDate(timestamp);
      expect(date.toISOString()).toBe('2024-05-10T10:00:00.000Z');
    });

    it('returns Date object as is', () => {
      const input = new Date('2024-05-10T10:00:00Z');
      expect(TimelineService.toJsDate(input)).toEqual(input);
    });

    it('converts raw Firestore timestamp object', () => {
      const rawTimestamp = { seconds: 1600000000, nanoseconds: 0 }; 
      const date = TimelineService.toJsDate(rawTimestamp);
      expect(date.getTime()).toBe(1600000000 * 1000);
    });

    it('returns current date if input is null', () => {
      const now = new Date().getTime();
      const date = TimelineService.toJsDate(null);
      expect(Math.abs(date.getTime() - now)).toBeLessThan(100);
    });
    
    it('converts string date input correctly', () => {
      const input = '2024-05-10T10:00:00.000Z';
      const date = TimelineService.toJsDate(input);
      expect(date.toISOString()).toBe(input);
    });
  });

  describe('calculateTaskStatus', () => {
    it('returns "overdue" when time difference exceeds negative tolerance', () => {
      const scheduled = new Date('2024-05-10T09:30:00Z');
      const status = TimelineService.calculateTaskStatus(scheduled, REF_DATE, 15);
      expect(status).toBe('overdue');
    });

    it('returns "current" when within tolerance window (past)', () => {
      const scheduled = new Date('2024-05-10T09:50:00Z');
      const status = TimelineService.calculateTaskStatus(scheduled, REF_DATE, 15);
      expect(status).toBe('current');
    });

    it('returns "current" when within tolerance window (future)', () => {
      const scheduled = new Date('2024-05-10T10:10:00Z');
      const status = TimelineService.calculateTaskStatus(scheduled, REF_DATE, 15);
      expect(status).toBe('current');
    });

    it('returns "upcoming" when far in the future', () => {
      const scheduled = new Date('2024-05-10T14:00:00Z');
      const status = TimelineService.calculateTaskStatus(scheduled, REF_DATE, 15);
      expect(status).toBe('upcoming');
    });
  });

  describe('getNextOccurrenceForTimeline', () => {
    it('calculates correct next occurrence for temporal task (same day)', () => {
      const REF_LOCAL = new Date(2024, 4, 10, 10, 0, 0); 
      const task: Task = { 
        ...BASE_TASK, 
        Type: 'temporal', 
        fixedTimes: ['08:00', '14:00', '19:00'], 
      };
        
      const next = TimelineService.getNextOccurrenceForTimeline(task, REF_LOCAL);
      expect(next?.getHours()).toBe(14);
      expect(next?.getDate()).toBe(10);
    });

    it('calculates correct next occurrence for temporal task (next day)', () => {
      const REF_LOCAL = new Date(2024, 4, 10, 10, 0, 0);
      const task: Task = { 
        ...BASE_TASK, 
        Type: 'temporal', 
        fixedTimes: ['08:00', '09:00'], 
      };
        
      const next = TimelineService.getNextOccurrenceForTimeline(task, REF_LOCAL);
      expect(next?.getHours()).toBe(8);
      expect(next?.getDate()).toBe(11);
    });

    it('handles unsorted fixed times correctly', () => {
      const REF_LOCAL = new Date(2024, 4, 10, 10, 0, 0);
      const task: Task = { 
        ...BASE_TASK, 
        Type: 'temporal', 
        fixedTimes: ['19:00', '08:00'], 
      };
      const next = TimelineService.getNextOccurrenceForTimeline(task, REF_LOCAL);
      expect(next?.getHours()).toBe(19);
      expect(next?.getDate()).toBe(10); 
    });

    it('returns null if task type is unknown', () => {
      // Pour tester la robustesse, on force un type inconnu via "as unknown"
      // C'est mieux que "any" car on signale explicitement qu'on force le type
      const task = { ...BASE_TASK, Type: 'unknown' as unknown as TaskType };
      expect(TimelineService.getNextOccurrenceForTimeline(task, REF_DATE)).toBeNull();
    });
    
    it('returns Date from startDateTime for Event type', () => {
      const dateEvent = new Date('2024-12-25T12:00:00Z');
      const task: Task = { 
        ...BASE_TASK, 
        Type: 'event', 
        startDateTime: dateEvent as unknown as Timestamp, // Simulation simplifiée
      };
      // Note: Le service utilise toJsDate, donc il accepte Date ou Timestamp
      expect(TimelineService.getNextOccurrenceForTimeline(task, REF_DATE)).toEqual(dateEvent);
    });
  });

  describe('organizeTimeline', () => {
    it('sorts overdue tasks first, then chronological', () => {
      const tasks: Task[] = [
        { ...MOCK_TASKS[0], id: 'future', nextOccurrence: new Date('2024-05-10T12:00:00Z') }, 
        { ...MOCK_TASKS[0], id: 'late', nextOccurrence: new Date('2024-05-10T09:00:00Z') },   
        { ...MOCK_TASKS[0], id: 'current', nextOccurrence: new Date('2024-05-10T10:05:00Z') }, 
      ];

      const timeline = TimelineService.organizeTimeline(tasks, REF_DATE, 15);
        
      expect(timeline[0].id).toContain('late');
      expect(timeline[0].status).toBe('overdue');
      expect(timeline[1].id).toContain('current');
      expect(timeline[2].id).toContain('future');
    });

    it('identifies the next upcoming task correctly', () => {
      const tasks: Task[] = [
        { ...MOCK_TASKS[0], id: 't1', nextOccurrence: new Date('2024-05-10T09:00:00Z') }, 
        { ...MOCK_TASKS[0], id: 't2', nextOccurrence: new Date('2024-05-10T11:00:00Z') }, 
        { ...MOCK_TASKS[0], id: 't3', nextOccurrence: new Date('2024-05-10T12:00:00Z') }, 
      ];

      const timeline = TimelineService.organizeTimeline(tasks, REF_DATE, 15);
      
      expect(timeline.find(t => t.task.id === 't1')?.isNextUpcoming).toBe(false);
      expect(timeline.find(t => t.task.id === 't2')?.isNextUpcoming).toBe(true);
      expect(timeline.find(t => t.task.id === 't3')?.isNextUpcoming).toBe(false);
    });

    it('ignores completed tasks', () => {
      const tasks: Task[] = [
        { ...BASE_TASK, id: '1', Status: 'completed', nextOccurrence: REF_DATE },
        { ...BASE_TASK, id: '2', Status: 'pending', nextOccurrence: REF_DATE },
      ];
      const result = TimelineService.organizeTimeline(tasks, REF_DATE);
      expect(result.length).toBe(1);
      expect(result[0].task.id).toBe('2');
    });

    it('ignores inactive tasks', () => {
      const tasks: Task[] = [
        { ...BASE_TASK, id: '1', Active: false, nextOccurrence: REF_DATE },
      ];
      const result = TimelineService.organizeTimeline(tasks, REF_DATE);
      expect(result.length).toBe(0);
    });
    
    it('handles tasks without nextOccurrence', () => {
      const tasks: Task[] = [
        { ...BASE_TASK, id: '1', nextOccurrence: undefined },
      ];
      const result = TimelineService.organizeTimeline(tasks, REF_DATE);
      expect(result.length).toBe(0);
    });
  });

  describe('getPeriodOfDay boundaries', () => {
    it('returns "morning" just before noon', () => {
      expect(TimelineService.getPeriodOfDay(11)).toBe('morning');
    });
    it('returns "afternoon" exactly at noon', () => {
      expect(TimelineService.getPeriodOfDay(12)).toBe('afternoon');
    });
    it('returns "afternoon" just before evening', () => {
      expect(TimelineService.getPeriodOfDay(17)).toBe('afternoon');
    });
    it('returns "evening" exactly at 18h', () => {
      expect(TimelineService.getPeriodOfDay(18)).toBe('evening');
    });
    it('returns "night" for late hours', () => {
      expect(TimelineService.getPeriodOfDay(23)).toBe('night');
    });
    it('returns "morning" for early hours', () => {
      expect(TimelineService.getPeriodOfDay(6)).toBe('morning');
    });
  });

  describe('groupByPeriod', () => {
    it('removes empty periods keys', () => {
      const items: TimelineItem[] = [
        { 
          id: '1', 
          period: 'morning', 
          task: BASE_TASK, 
          scheduledTime: new Date(), 
          status: 'upcoming', 
          isNextUpcoming: false, 
        },
      ];
      const grouped = TimelineService.groupByPeriod(items);
      expect(grouped.morning).toHaveLength(1);
      expect(grouped.afternoon).toBeUndefined();
      expect(grouped.night).toBeUndefined();
    });
  });
  
  describe('utils', () => {
    it('returns placeholder for invalid date', () => {
      expect(TimelineService.formatTime(new Date('invalid'))).toBe('--:--');
    });

    it('returns period key if no label found', () => {
      // On utilise "as unknown as..." pour forcer un test de robustesse
      // sur une valeur qui ne devrait théoriquement pas exister
      const invalidPeriod = 'invalid_period' as unknown as TimelineItem['period'];
      const label = TimelineService.getPeriodLabel(invalidPeriod);
      expect(label).toBe('invalid_period');
    });

    it('returns gray color for standard upcoming task', () => {
      const color = TimelineService.getStatusColor('upcoming', false);
      expect(color).toBe('#6c757d');
    });
  });
});