// tests/src/testTimeline/useFamilyTimeline.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useFamilyTimeline } from '../../../src/hooks/useFamilyTimeline';
import { taskService } from '../../../src/services/taskService';

// Mock du module entier
jest.mock('../../../src/services/taskService', () => ({
  taskService: {
    subscribeToFamilyTasks: jest.fn(),
  },
}));

const MOCK_TASKS = [
  { 
    id: '1', 
    Name: 'Task 1', 
    Active: true, 
    nextOccurrence: new Date(), 
    assignedMembers: [],
    Status: 'pending',
    Type: 'recurring', 
  },
];

describe('useFamilyTimeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock par défaut pour éviter le crash au démontage
    (taskService.subscribeToFamilyTasks as jest.Mock).mockImplementation(() => () => {});
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useFamilyTimeline('family1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.timeline).toEqual([]);
  });

  it('subscribes to tasks and updates timeline on success', async () => {
    (taskService.subscribeToFamilyTasks as jest.Mock).mockImplementation((id, onSuccess) => {
      setTimeout(() => {
        onSuccess(MOCK_TASKS);
      }, 10);
      return () => {}; 
    });

    const { result } = renderHook(() => useFamilyTimeline('family1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.timeline.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    expect(result.current.timeline[0].task.id).toBe('1');
  });

  it('handles errors gracefully', async () => {
    (taskService.subscribeToFamilyTasks as jest.Mock).mockImplementation((id, onSuccess, onError) => {
      setTimeout(() => {
        onError(new Error('Permission denied'));
      }, 10);
      return () => {};
    });

    const { result } = renderHook(() => useFamilyTimeline('family1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Permission denied');
    });
  });

  // Test séparé pour les timers avec FakeTimers
  // Dans useFamilyTimeline.test.ts

  it('updates current time every minute', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useFamilyTimeline('family1'));
    const initialTime = result.current.currentTime.getTime();

    // Envelopper dans act
    act(() => {
      jest.advanceTimersByTime(60000); 
    });

    expect(result.current.currentTime.getTime()).toBeGreaterThan(initialTime);
    jest.useRealTimers();
  });

  it('clears interval on unmount', () => {
    jest.useFakeTimers();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useFamilyTimeline('family1'));
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });
});