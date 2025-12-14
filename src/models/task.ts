import { Timestamp } from 'firebase/firestore';

export type TaskType = 'recurring' | 'temporal' | 'event';
export type TaskStatus = 'completed' | 'pending' | 'overdue';

export interface Task {
  id: string;
  Name: string;
  Icon: string;
  Type: TaskType;
  Active: boolean;
  Status: TaskStatus;
  Tolerance: number;
  Validation: boolean;
  assignedMembers: string[];
  createdAt: Timestamp;
  nextOccurrence?: Date;
  fixedTimes?: string[];
  startDateTime?: Timestamp;
  comments?: string;
  evaluation?: number;
}

export interface Tutor {
  id: string;
  firstname: string;
  name: string;
  email: string;
}

export interface CreateTaskData {
  Name: string;
  Icon: string;
  Type: TaskType;
  Active: boolean;
  Status: TaskStatus;
  Tolerance: number;
  Validation: boolean;
  assignedMembers: string[];
  startDateTime?: Timestamp;
  nextOccurrence?: Date;
  fixedTimes?: string[];
  comments?: string;
  evaluation?: number;
}

export type RecurrentTask = {
    taskId: string;
    occurredAt: number;
};

export type PonctualTask = {
    taskId: string;
    startingAt: Date;
};
