import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  Name: string;
  Icon: string;
  Type: 'recurring' | 'temporal' | 'event';
  Active: boolean;
  Status: 'completed' | 'pending' | 'overdue';
  Tolerance: number;
  assignedMembers: string[];
  createdAt: Timestamp;
  nextOccurrence?: Date;
  fixedTimes?: string[];
  startDateTime?: Timestamp;
}

export type RecurrentTask = {
    taskId: string;
    occurredAt: number;
};

export type PonctualTask = {
    taskId: string;
    startingAt: Date;
};
