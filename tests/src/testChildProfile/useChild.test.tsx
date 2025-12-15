import { act, renderHook } from '@testing-library/react-native';
import { useChild } from '../../../src/hooks/useChild';
import { addChildToFamily } from '../../../src/services/childService';

jest.mock('../../../src/services/childService', () => ({
  addChildToFamily: jest.fn(),
}));

const mockAddChildToFamily = addChildToFamily as jest.Mock;

describe('useChild', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialise avec loading=false et error=null', () => {
    const { result } = renderHook(() => useChild());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('appelle addChildToFamily et retourne childId en cas de succès', async () => {
    mockAddChildToFamily.mockResolvedValueOnce('child123');

    const { result } = renderHook(() => useChild());

    let returnedId: string | undefined;

    await act(async () => {
      returnedId = await result.current.createChild('fam123', {
        firstName: 'Haya',
        lastName: 'Alice',
        gender: 'female',
        birthday: new Date(),
      });
    });

    expect(mockAddChildToFamily).toHaveBeenCalled();
    expect(returnedId).toBe('child123');
    expect(result.current.loading).toBe(false);
  });

  it('relance l\'erreur si addChildToFamily échoue', async () => {
    mockAddChildToFamily.mockRejectedValueOnce(new Error('Erreur API'));

    const { result } = renderHook(() => useChild());

    await expect(
      act(async () => {
        await result.current.createChild('fam123', {
          firstName: 'Haya',
          lastName: 'Alice',
          gender: 'female',
          birthday: new Date(),
        });
      }),
    ).rejects.toThrow('Erreur API');

    expect(result.current.loading).toBe(false);
  });

  it('loading repasse toujours à false même en cas derreur', async () => {
    mockAddChildToFamily.mockRejectedValueOnce(new Error('Crash'));

    const { result } = renderHook(() => useChild());

    await expect(
      act(async () => {
        await result.current.createChild('fam123', {
          firstName: 'Test',
          lastName: 'User',
          gender: 'male',
          birthday: new Date(),
        });
      }),
    ).rejects.toThrow('Crash');

    expect(result.current.loading).toBe(false);
  });
});
