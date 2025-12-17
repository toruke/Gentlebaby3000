import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useCreateChildForm } from '../../../src/hooks/useCreateChild';

// --------------------------------------------------
// MOCK expo-router
// --------------------------------------------------
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'fam123' }),
  useRouter: () => ({ back: jest.fn() }),
}));

// --------------------------------------------------
// MOCK useChild
// --------------------------------------------------
const mockCreateChild = jest.fn();

jest.mock('../../../src/hooks/useChild', () => ({
  useChild: () => ({
    createChild: mockCreateChild,
    loading: false,
  }),
}));

// --------------------------------------------------
// MOCK validators
// --------------------------------------------------
jest.mock('../../../src/utils/validators', () => ({
  validateName: (v: string) => v.length >= 2,
  isChildAgeValid: () => true,
}));

// ==================================================
describe('useCreateChildForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialise le formulaire avec des valeurs invalides', () => {
    const { result } = renderHook(() => useCreateChildForm());

    expect(result.current.isFormValid).toBe(false);
    expect(result.current.touched.firstName).toBe(false);
  });

  it('marque un champ comme touché avec handleBlur', () => {
    const { result } = renderHook(() => useCreateChildForm());

    act(() => {
      result.current.handleBlur('firstName');
    });

    expect(result.current.touched.firstName).toBe(true);
  });

  it('devient valide lorsque tous les champs sont remplis', () => {
    const { result } = renderHook(() => useCreateChildForm());

    act(() => {
      result.current.setFirstName('Haya');
      result.current.setLastName('Alice');
      result.current.setSelectedGender('female');
    });

    expect(result.current.isFormValid).toBe(true);
  });

  it('appelle createChild lors de la soumission valide', async () => {
    const { result } = renderHook(() => useCreateChildForm());

    act(() => {
      result.current.setFirstName('Haya');
      result.current.setLastName('Alice');
      result.current.setSelectedGender('female');
    });

    await act(async () => {
      await result.current.submitForm();
    });

    expect(mockCreateChild).toHaveBeenCalled();
  });

  it('affiche une alerte si createChild échoue', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => { });
    mockCreateChild.mockRejectedValueOnce(new Error('Erreur API'));

    const { result } = renderHook(() => useCreateChildForm());

    act(() => {
      result.current.setFirstName('Haya');
      result.current.setLastName('Alice');
      result.current.setSelectedGender('female');
    });

    await act(async () => {
      await result.current.submitForm();
    });

    expect(Alert.alert).toHaveBeenCalled();
  });
});
