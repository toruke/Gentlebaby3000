
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import ChildProfileScreen from '../../../src/screens/child/childProfileScreen';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'fam123', childId: 'child123' }),
}));

const mockGetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  Timestamp: {
    fromDate: jest.fn(),
  },
}));

jest.mock('../../../config/firebaseConfig', () => ({
  db: {},
}));

describe('US-116 : ChildProfileScreen', () => {
  let alertMock: jest.SpyInstance;

  beforeEach(() => {
    mockGetDoc.mockReset();
    alertMock = jest.spyOn(Alert, 'alert').mockImplementation(() => { });
  });

  afterEach(() => {
    alertMock.mockRestore();
  });

  // -----------------------------------------------------
  it('affiche le loader pendant le chargement initial', () => {
    mockGetDoc.mockImplementation(
      () => new Promise(() => { /* ne se résout pas */ }),
    );

    const { getByTestId } = render(<ChildProfileScreen />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  // -----------------------------------------------------
  it('affiche une alerte si la famille n\'existe pas', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => null,
    });

    render(<ChildProfileScreen />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        'Erreur',
        'Famille introuvable.',
      );
    });
  });

  it('affiche une alerte si l\'enfant n\'est pas trouvé', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: 'Famille Test',
        createdByName: 'Raya Rayo',
        babies: [
          {
            id: 'autre-enfant',
            firstName: 'Autre',
            lastName: 'Enfant',
          },
        ],
      }),
    });

    render(<ChildProfileScreen />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        'Erreur',
        'Enfant introuvable.',
      );
    });
  });

  // -----------------------------------------------------
  it('affiche correctement les infos de l’enfant', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: 'Famille Test',
        createdByName: 'Raya Rayo',
        babies: [
          {
            id: 'child123',
            firstName: 'Haya',
            lastName: 'Alice',
            birthDate: {
              toDate: () => new Date('2025-12-07'),
            },
            gender: 'female',
            deviceId: null,
          },
        ],
      }),
    });

    render(<ChildProfileScreen />);

    expect(await screen.findByText(/Haya Alice/i)).toBeTruthy();

    expect(await screen.findByText(/Famille Test/i)).toBeTruthy();

    expect(await screen.findByText(/Raya Rayo/i)).toBeTruthy();

    expect(await screen.findByText('07/12/2025')).toBeTruthy();
  });

  // -----------------------------------------------------
  it('affiche une alerte générique si Firestore lève une erreur', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('Firestore KO'));

    render(<ChildProfileScreen />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de charger le profil.',
      );
    });
  });
});
