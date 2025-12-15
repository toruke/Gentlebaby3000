import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WeatherTimelineBar } from '../../../src/components/timeline/weatherTimelineBar';
import { TimelineItem } from '../../../src/services/timelineService';
import { Task } from '../../../src/models/task';
import { Timestamp } from 'firebase/firestore';

// 1. Définition d'une Tâche "Bouchon" (Mock) valide par défaut
// Cela évite de répéter toutes les propriétés obligatoires à chaque fois
const BASE_TASK: Task = {
  id: 'default-task-id',
  Name: 'Default Task',
  Icon: '📝',
  Type: 'event',
  Active: true,
  Status: 'pending',
  Tolerance: 15,
  Validation: false,
  assignedMembers: [],
  createdAt: Timestamp.fromDate(new Date(0)), // Mock du Timestamp Firestore
};

// 2. Helper pour créer un TimelineItem valide
// On utilise Partial<TimelineItem> pour permettre de ne surcharger que ce qu'on veut
const createMockItem = (overrides: Partial<TimelineItem> = {}): TimelineItem => {
  return {
    id: 'default-id',
    task: { ...BASE_TASK }, // Une copie propre de la tâche de base
    scheduledTime: new Date(),
    status: 'upcoming',
    period: 'morning',
    isNextUpcoming: false,
    ...overrides,
  };
};

const MOCK_TIME = new Date('2024-05-10T10:00:00');

// 3. Utilisation du helper pour créer la liste initiale
const MOCK_ITEMS: TimelineItem[] = [
  createMockItem({
    id: '1',
    task: { ...BASE_TASK, id: 't1', Name: 'Manger', Icon: '🍽️' },
    scheduledTime: new Date('2024-05-10T11:00:00'),
    status: 'upcoming',
    isNextUpcoming: true,
  }),
  createMockItem({
    id: '2',
    task: { ...BASE_TASK, id: 't2', Name: 'Dormir', Icon: '💤' },
    scheduledTime: new Date('2024-05-12T10:00:00'),
    status: 'upcoming',
    isNextUpcoming: false,
  }),
  createMockItem({
    id: '3',
    task: { ...BASE_TASK, id: 't3', Name: 'Retard', Icon: '⏰' },
    scheduledTime: new Date('2024-05-10T09:00:00'),
    status: 'overdue',
    isNextUpcoming: false,
  }),
];

describe('WeatherTimelineBar', () => {
  it('renders only relevant items (next 24h + overdue)', () => {
    const { getByText, queryByText } = render(
      <WeatherTimelineBar 
        timelineItems={MOCK_ITEMS} 
        onItemPress={jest.fn()} 
        currentTime={MOCK_TIME} 
      />,
    );

    expect(getByText('Manger')).toBeTruthy();
    expect(getByText('Retard')).toBeTruthy();
    expect(queryByText('Dormir')).toBeNull();
  });

  it('calls onItemPress with correct index when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <WeatherTimelineBar 
        timelineItems={MOCK_ITEMS} 
        onItemPress={mockPress} 
        currentTime={MOCK_TIME} 
      />,
    );

    fireEvent.press(getByText('Manger'));
    expect(mockPress).toHaveBeenCalled();
  });

  it('displays empty message if no items', () => {
    const { getByText } = render(
      <WeatherTimelineBar 
        timelineItems={[]} 
        onItemPress={jest.fn()} 
        currentTime={MOCK_TIME} 
      />,
    );
    expect(getByText(/Rien à l'horizon/i)).toBeTruthy();
  });
});

describe('WeatherTimelineBar - Advanced Coverage', () => {
  
  it('shows item within 23 hours', () => {
    // Plus besoin de 'any', on utilise le helper
    const item23h = createMockItem({
      id: 'A',
      task: { ...BASE_TASK, Icon: 'A', Name: 'Task A' },
      scheduledTime: new Date(Date.now() + 23 * 60 * 60 * 1000), 
      status: 'upcoming',
    });
    
    const { getAllByText } = render(
      <WeatherTimelineBar timelineItems={[item23h]} onItemPress={jest.fn()} currentTime={new Date()} />,
    );
    expect(getAllByText('Task A').length).toBeGreaterThan(0);
  });

  it('hides item after 25 hours', () => {
    const item25h = createMockItem({
      id: 'B',
      task: { ...BASE_TASK, Icon: 'B', Name: 'Task B' },
      scheduledTime: new Date(Date.now() + 26 * 60 * 60 * 1000), 
      status: 'upcoming',
    });
    
    const { queryByText } = render(
      <WeatherTimelineBar timelineItems={[item25h]} onItemPress={jest.fn()} currentTime={new Date()} />,
    );
    expect(queryByText('Task B')).toBeNull();
  });

  it('always shows overdue items even if very old', () => {
    const itemOld = createMockItem({
      id: 'OLD',
      task: { ...BASE_TASK, Icon: 'Old', Name: 'Task Old' },
      scheduledTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // -48h
      status: 'overdue', 
    });
    
    const { getAllByText } = render(
      <WeatherTimelineBar timelineItems={[itemOld]} onItemPress={jest.fn()} currentTime={new Date()} />,
    );
    expect(getAllByText('Task Old').length).toBeGreaterThan(0);
  });
  
  it('calls correct index when filtering is applied', () => {
    const currentTime = new Date();
    
    // On construit la liste typée proprement
    const items: TimelineItem[] = [
      createMockItem({ 
        id: '1', 
        task: { ...BASE_TASK, Name: 'Task1' }, 
        scheduledTime: currentTime, 
        status: 'overdue', 
      }),
      createMockItem({ 
        id: '2', 
        task: { ...BASE_TASK, Name: 'Task2' }, 
        scheduledTime: new Date(currentTime.getTime() + 30 * 3600000), 
        status: 'upcoming', 
      }),
      createMockItem({ 
        id: '3', 
        task: { ...BASE_TASK, Name: 'Task3' }, 
        scheduledTime: new Date(currentTime.getTime() + 1 * 3600000), 
        status: 'upcoming', 
      }),
    ];
      
    const mockPress = jest.fn();
    const { getAllByText } = render(
      <WeatherTimelineBar timelineItems={items} onItemPress={mockPress} currentTime={currentTime} />,
    );
      
    fireEvent.press(getAllByText('Task3')[0]);
    expect(mockPress).toHaveBeenCalledWith(2); 
  });
});