import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimelineItemCard } from '../../../src/components/timeline/timelineItemCard';
import { TimelineItem } from '../../../src/services/timelineService';
import { Task } from '../../../src/models/task';
import { Timestamp } from 'firebase/firestore';

// 1. Tâche de base valide par défaut (Typage Strict)
const BASE_TASK: Task = {
  id: 't1',
  Name: 'Test Task',
  Icon: '🧪',
  Type: 'recurring',
  Active: true,
  Status: 'pending',
  Tolerance: 15,
  Validation: false,
  assignedMembers: ['Maman', 'Papa'],
  // On utilise 'as unknown as Timestamp' pour mocker proprement l'objet Firebase
  createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Timestamp,
};

// 2. Helper typé : accepte des overrides partiels de TimelineItem et de Task
const createMockItem = (
  overrides: Partial<TimelineItem> = {}, 
  taskOverrides: Partial<Task> = {},
): TimelineItem => {
  const NOW = new Date(); 
  
  return {
    id: '1',
    // Fusion propre : Base + Surcharges
    task: {
      ...BASE_TASK,
      ...taskOverrides,
    },
    scheduledTime: NOW, 
    status: 'upcoming',
    period: 'morning',
    isNextUpcoming: false,
    ...overrides,
  };
};

describe('TimelineItemCard', () => {

  it('renders task details correctly', () => {
    const mockItem = createMockItem();
    const { getByText } = render(
      <TimelineItemCard item={mockItem} onPress={jest.fn()} />,
    );

    expect(getByText('Test Task')).toBeTruthy();
    expect(getByText('🧪')).toBeTruthy();
    expect(getByText(/membre/i)).toBeTruthy(); 
  });

  it('displays "C\'est le moment !" when status is current', () => {
    const item = createMockItem({ status: 'current', scheduledTime: new Date() });
    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    expect(getByText('C\'est le moment !')).toBeTruthy();
  });

  it('displays relative time in minutes if < 60 min', () => {
    // Dans 45 minutes
    const futureDate = new Date(Date.now() + 45 * 60000);
    const item = createMockItem({ scheduledTime: futureDate, status: 'upcoming' });
    
    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    
    // Regex pour absorber le temps d'exécution (44 ou 45 min)
    expect(getByText(/Dans 4[4-5] min/)).toBeTruthy();
  });

  it('displays relative time in hours/min if between 60 and 120 min', () => {
    // Dans 90 minutes (1h30)
    const futureDate = new Date(Date.now() + 90 * 60000);
    const item = createMockItem({ scheduledTime: futureDate, status: 'upcoming' });

    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    
    // Regex pour 1h29 ou 1h30
    expect(getByText(/Dans 1h (29|30)min/)).toBeTruthy();
  });

  it('displays "Demain" if the date is tomorrow', () => {
    // Demain à la même heure (+24h et 5s de marge)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000 + 5000);
    const item = createMockItem({ scheduledTime: tomorrow, status: 'upcoming' });

    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    expect(getByText(/Demain/)).toBeTruthy();
  });

  it('displays huge overdue time correctly', () => {
    // Retard de 125 minutes (2h05)
    // On retire un peu plus pour être sûr d'avoir au moins 2h05 affiché
    const pastDate = new Date(Date.now() - 125 * 60000 - 1000);
    const item = createMockItem({ scheduledTime: pastDate, status: 'overdue' });

    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    
    expect(getByText(/En retard de 2h/)).toBeTruthy();
  });

  it('displays "À HH:MM" for task later today (> 2 hours)', () => {
    // On fixe "Maintenant" à 10h00 du matin
    const morning = new Date('2024-05-10T10:00:00Z');
    
    // On fixe la tâche à 14h00 le même jour (soit +4 heures)
    const laterToday = new Date('2024-05-10T14:00:00Z');
    
    const item = createMockItem({ 
      scheduledTime: laterToday, 
      status: 'upcoming', 
    });

    const { getByText } = render(
      <TimelineItemCard 
        item={item} 
        onPress={jest.fn()} 
        testCurrentTime={morning} // On force l'heure actuelle
      />,
    );
    
    // Doit afficher "À 14:00" (ou équivalent local)
    expect(getByText(/^À \d{2}:\d{2}$/)).toBeTruthy();
  });

  it('shows "SUIVANT" badge when isNextUpcoming is true', () => {
    const item = createMockItem({ status: 'upcoming', isNextUpcoming: true });
    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    expect(getByText('SUIVANT')).toBeTruthy();
  });

  it('shows overdue alert style', () => {
    const item = createMockItem({ status: 'overdue' });
    const { getAllByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    // Vérifie texte rouge
    expect(getAllByText(/Retard/i).length).toBeGreaterThan(0);
  });

  it('handles invalid date gracefully', () => {
    const item = createMockItem({ scheduledTime: new Date('invalid') });
    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    expect(getByText('Date invalide')).toBeTruthy();
  });

  it('displays correct label for Temporal Task', () => {
    // On surcharge juste le Type
    const item = createMockItem({}, { Type: 'temporal' });
    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    expect(getByText('⏰ Heure fixe')).toBeTruthy();
  });

  it('displays correct label for Event Task', () => {
    const item = createMockItem({}, { Type: 'event' });
    const { getByText } = render(<TimelineItemCard item={item} onPress={jest.fn()} />);
    expect(getByText('📅 Événement')).toBeTruthy();
  });

  it('calls onPress with task object', () => {
    const mockItem = createMockItem();
    const mockPress = jest.fn();
    const { getByText } = render(
      <TimelineItemCard item={mockItem} onPress={mockPress} />,
    );

    fireEvent.press(getByText('Test Task'));
    expect(mockPress).toHaveBeenCalledWith(mockItem.task);
  });
});