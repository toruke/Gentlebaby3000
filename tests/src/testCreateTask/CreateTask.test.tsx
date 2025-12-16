//tests\src\testCreateTask\CreateTask.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CreateTaskScreen from '../../../src/screens/task/createTaskScreen';


// ======================================================
// Mocks autorisés (⚠️ préfixés par mock → IMPORTANT)
// ======================================================
const mockSetTaskIcon = jest.fn();
const mockSetTaskType = jest.fn();
const mockSubmit = jest.fn();

// ======================================================
// Mock expo-router
// ======================================================
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    id: 'family-123',
  }),
}));

// ======================================================
// Mock DateTimePicker
// ======================================================
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// ======================================================
// Mock MemberSelector
// ======================================================
// Mock MemberSelector
jest.mock('../../../src/components/task/memberSelector', () => ({
  MemberSelector: () => null,
}));



// ======================================================
// Mock hook useCreateTask
// ======================================================
jest.mock('../../../src/hooks/useCreateTask', () => ({
  useCreateTask: () => ({
    // ---- state ----
    taskName: '',
    taskIcon: '',
    responsibleMembers: [],
    taskType: 'recurring',
    interval: '',
    startDateTime: new Date('2024-01-01T10:00:00'),
    fixedTimes: '',
    comments: '',
    evaluation: 0,

    availableTutors: [],
    loading: false,
    isSubmitting: false,
    errors: {},
    showDatePicker: false,

    // ---- setters ----
    setTaskName: jest.fn(),
    setTaskIcon: mockSetTaskIcon,
    setTaskType: mockSetTaskType,
    setInterval: jest.fn(),
    setFixedTimes: jest.fn(),
    setComments: jest.fn(),
    setEvaluation: jest.fn(),
    setShowDatePicker: jest.fn(),

    // ---- handlers ----
    handleTextChange: (fn: any) => fn,
    toggleMember: jest.fn(),
    onDateChange: jest.fn(),
    submit: mockSubmit,
  }),
}));

// ======================================================
// TESTS
// ======================================================
describe('CreateTaskScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le titre', () => {
    const { getByText } = render(<CreateTaskScreen />);
    expect(getByText('Créer une nouvelle tâche')).toBeTruthy();
  });

  it('affiche le champ nom de la tâche', () => {
    const { getByPlaceholderText } = render(<CreateTaskScreen />);
    expect(getByPlaceholderText('Nom de la tâche')).toBeTruthy();
  });

  it('permet de sélectionner une icône', () => {
    const { getByText } = render(<CreateTaskScreen />);
    fireEvent.press(getByText('🍼'));
    expect(mockSetTaskIcon).toHaveBeenCalledWith('🍼');
  });

  it('affiche le sélecteur de membres sans crash', () => {
    render(<CreateTaskScreen />);
    expect(true).toBe(true); // test de stabilité
  });

  it('change le type de tâche', () => {
    const { getByText } = render(<CreateTaskScreen />);
    fireEvent.press(getByText('Temporel'));
    expect(mockSetTaskType).toHaveBeenCalledWith('temporal');
  });

  it('affiche les champs récurrents quand taskType = recurring', () => {
    const { getByPlaceholderText } = render(<CreateTaskScreen />);
    expect(getByPlaceholderText('Intervalle (heures)')).toBeTruthy();
  });

  it('affiche le bouton de création', () => {
    const { getByText } = render(<CreateTaskScreen />);
    expect(getByText('Créer la tâche')).toBeTruthy();
  });

  it('appelle submit au clic sur le bouton créer', () => {
    const { getByText } = render(<CreateTaskScreen />);
    fireEvent.press(getByText('Créer la tâche'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
