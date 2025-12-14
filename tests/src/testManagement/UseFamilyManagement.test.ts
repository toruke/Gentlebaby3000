import { describe, it, expect } from '@jest/globals';
import {useFamilyManagement } from '@/src/hooks/useFamilyManagement';
import { renderHook, act, waitFor} from '@testing-library/react-native';

declare global {
  var _focusCallback: (() => void) | undefined;
}

const mockGetFamilyService = jest.fn();
jest.mock('../../../src/services/FamilyMangement', () => ({
  getFamilySelectedService: (id: string) => mockGetFamilyService(id),
}));

const mockFocusEffect = jest.fn();
jest.mock('@react-navigation/native', () => ({

  useFocusEffect: (callback : () => (() => void) | void) => mockFocusEffect(callback),
}));
const MOCK_MEMBERS = [
  { idUser: 'u1', idFamily: 'f1', name: 'Alice Smith', role: 'Tuteur', device: {
    id: '1',
    serialNumber: 'ABC123',
    type: 'transmitter',
    status: 'connected',
    pairedAt: '2024-04-01T10:00:00',
    lastSeen: '2024-04-01T12:00:00',
  } }, 
  { idUser: 'u2', idFamily: 'f1', name: 'Bob Smith', role: 'Enfant', device: undefined },
];

describe('useFamilyManagement (Unit Test)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any)._focusCallback = undefined;
    
    mockFocusEffect.mockImplementation((callback) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any)._focusCallback = callback;
      return jest.fn(); // Retourne une fonction de nettoyage vide
    });  
  });

  // Initialisation sans ID 
  it('should initialize with empty family, false loading, and empty error', () => {
    const { result } = renderHook(() => useFamilyManagement(undefined));

    expect(result.current.family).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockGetFamilyService).not.toHaveBeenCalled();
    expect(result.current.error).toBe(''); 
  });
  
  // Déclenchement au focus avec un ID (Succès)
  it('should fetch family members when ID is provided on focus and succeed', async () => {
    mockGetFamilyService.mockResolvedValue(MOCK_MEMBERS);
    const { result } = renderHook(() => useFamilyManagement('f1'));
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any)._focusCallback(); 
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetFamilyService).toHaveBeenCalledWith('f1');
    expect(result.current.error).toBe('');
    expect(result.current.family).toEqual(MOCK_MEMBERS);  });

  // Déclenchement au focus avec un ID (Échec)
  it('should handle API failure correctly when fetching family members', async () => {
    mockGetFamilyService.mockRejectedValue(new Error('API error'));
    
    const { result } = renderHook(() => useFamilyManagement('f1'));

    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any)._focusCallback(); 
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetFamilyService).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe('Impossible de charger cette famille');
    expect(result.current.family).toEqual([]);
  });
  
  // Appel direct de selectFamily avec un ID
  it('should allow manual family selection using selectFamily function', async () => {
    mockGetFamilyService.mockResolvedValue(MOCK_MEMBERS);
    const { result } = renderHook(() => useFamilyManagement(undefined));

    act(() => {
      result.current.selectFamily('manual-id-456');
    });
    await waitFor(() => expect(result.current.family).toEqual(MOCK_MEMBERS));
    expect(result.current.loading).toBe(false);
    expect(mockGetFamilyService).toHaveBeenCalledWith('manual-id-456');
  });
});