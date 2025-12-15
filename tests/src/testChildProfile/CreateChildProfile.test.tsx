import { fireEvent, render, screen } from '@testing-library/react-native';
import React, { ReactNode } from 'react';
import { useCreateChildForm } from '../../../src/hooks/useCreateChild';
import CreateChildProfileScreen from '../../../src/screens/child/createChildProfileScreen';

// --------------------------------------------------
// Types utilitaires
// --------------------------------------------------
type LinkProps = { children: ReactNode };
type UseCreateChildFormReturn = ReturnType<typeof useCreateChildForm>;

// --------------------------------------------------
// MOCK expo-router
// --------------------------------------------------
jest.mock('expo-router', () => {
  const Link = ({ children }: LinkProps) => children;
  const useLocalSearchParams = () => ({ id: 'fam123' });
  const useRouter = () => ({ back: jest.fn() });

  return {
    __esModule: true,
    Link,
    useLocalSearchParams,
    useRouter,
  };
});

// --------------------------------------------------
// MOCK composants childForm (CHEMIN CORRECT)
// --------------------------------------------------
jest.mock('../../../src/components/child/childForm', () => {
  const { Text } = jest.requireActual('react-native');

  const mockValidatedInput = (props: { label: string }) => (
    <Text>{props.label}</Text>
  );
  const mockDateSelector = () => <Text>DateSelector</Text>;
  const mockGenderSelector = () => <Text>GenderSelector</Text>;

  return {
    __esModule: true,
    ValidatedInput: mockValidatedInput,
    DateSelector: mockDateSelector,
    GenderSelector: mockGenderSelector,
  };
});

// --------------------------------------------------
// MOCK hook useCreateChildForm
// --------------------------------------------------
const mockSubmitForm = jest.fn();

const mockHook: UseCreateChildFormReturn = {
  formValues: {
    firstName: '',
    lastName: '',
    birthDate: new Date(),
    selectedGender: undefined,
  },
  setFirstName: jest.fn(),
  setLastName: jest.fn(),
  setBirthDate: jest.fn(),
  setSelectedGender: jest.fn(),
  loading: false,
  touched: {
    firstName: false,
    lastName: false,
    birthDate: false,
    gender: false,
  },
  validations: {
    isFirstNameValid: false,
    isLastNameValid: false,
    isBirthDateValid: false,
    isGenderValid: false,
  },
  isFormValid: false,
  handleBlur: jest.fn(),
  submitForm: mockSubmitForm,
};

jest.mock('../../../src/hooks/useCreateChild', () => ({
  __esModule: true,
  useCreateChildForm: jest.fn(() => mockHook),
}));

// ==================================================
describe('US-116 : CreateChildProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHook.loading = false;
    mockHook.isFormValid = false;
  });

  // --------------------------------------------------
  it('affiche le titre et le sous-titre', () => {
    render(<CreateChildProfileScreen />);

    expect(screen.getByText('Création du profil Enfant')).toBeTruthy();
    expect(
      screen.getByText('Ajoutez les informations de votre enfant'),
    ).toBeTruthy();
  });

  // --------------------------------------------------
  it('affiche les champs du formulaire', () => {
    render(<CreateChildProfileScreen />);

    expect(screen.getByText('Prénom *')).toBeTruthy();
    expect(screen.getByText('Nom *')).toBeTruthy();
    expect(screen.getByText('DateSelector')).toBeTruthy();
    expect(screen.getByText('GenderSelector')).toBeTruthy();
  });

  // -------------------------------------------------
  it('désactive le bouton si le formulaire est invalide', () => {
    render(<CreateChildProfileScreen />);

    const button = screen.getByTestId('create-child-button');

    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  // --------------------------------------------------
  it('affiche "Création..." lorsque loading est actif', () => {
    mockHook.loading = true;

    render(<CreateChildProfileScreen />);

    expect(screen.getByText('Création...')).toBeTruthy();

    mockHook.loading = false;
  });

  // --------------------------------------------------
  it('appelle submitForm quand le formulaire est valide', () => {
    mockHook.isFormValid = true;

    render(<CreateChildProfileScreen />);

    fireEvent.press(screen.getByText('Créer le profil'));
    expect(mockSubmitForm).toHaveBeenCalled();

    mockHook.isFormValid = false;
  });
});
