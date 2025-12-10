/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {FamilyMembers, FamilyMember} from '../../../src/components/FamilyMember';

// --- MOCKS NÉCESSAIRES ---

jest.mock('../../../src/styles/globalStyles', () => ({
  styles: {
    container: {},
    header: {},
    greeting: {},
    subtitle: {},
    statsContainer: {},
    statItem: {},
    statNumber: {},
    statLabel: {},
    section: {},
    sectionTitle: {},
    memberCard: {},
    memberHeader: {},
    memberInfo: {},
    avatar: {},
    avatarText: {},
    memberDetails: {},
    memberName: {},
    roleBadge: {},
    roleText: {},
    devicesSection: {},
    devicesTitle: {},
    deviceItem: {},
    deviceInfo: {},
    deviceIcon: {},
    deviceDetails: {},
    deviceName: {},
    deviceType: {},
    deviceStatus: {},
    statusIndicator: {},
    statusText: {},
    lastSeen: {},
    actionsContainer: {},
    actionButton: {},
    actionText: {},
    addMemberButton: {},
    addMemberText: {},
    backLink: {},
    backText: {},
  },
}));

// 2. Mock des fonctions utilitaires 
jest.mock('../../../src/utils/familyUtils', () => ({
  getRoleColor: jest.fn(() => '#CCCCCC'),
  getStatusColor: jest.fn(() => 'green'),
  getStatusText: jest.fn((status) => (status === 'connected' ? 'Connecté' : 'Déconnecté')),
  getUpperName: jest.fn((name) => name.toUpperCase()),
}));

// 3. Mock d'expo-router (essentiel pour useRouter et Link)
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  // Use require() to bring in TouchableOpacity within the factory scope
  const { TouchableOpacity } = require('react-native'); 
    
  return {
    useRouter: () => ({
      push: mockPush,
    }),
    // Ensure the Link component uses the required TouchableOpacity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ href, children, onPress }: any) => ( 
      <TouchableOpacity testID="mock-link" onPress={onPress || (() => mockPush(href))}>
        {children}
      </TouchableOpacity>
    ),
  };
});

const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    idUser: 'u1',
    idFamily: 'f1',
    name: 'Alice Smith',
    role: 'Tuteur',
    device: {
      id: '1',
      serialNumber: 'ABC123',
      type: 'transmitter',
      status: 'connected',
      pairedAt: '2024-04-01T10:00:00',
      lastSeen: '2024-04-01T12:00:00',
    },
  },
  {
    idUser: 'u2',
    idFamily: 'f1',
    name: 'Bob Smith',
    role: 'Enfant',
    device: undefined,
  },
];
describe('FamilyMembers Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders family members correctly', () => {
    const { getByText, getAllByText } = render(<FamilyMembers familyMembers={MOCK_FAMILY_MEMBERS} />);

    expect(getByText('Alice Smith')).toBeTruthy();
    expect(getByText('Bob Smith')).toBeTruthy();

    expect(getByText('TUTEUR')).toBeTruthy();
    expect(getByText('ENFANT')).toBeTruthy();

    expect(getAllByText('Modifier Rôle').length).toBeGreaterThanOrEqual(2);
    expect(getByText('Ajouter Appareil')).toBeTruthy();
  });

  it('displays correct statistics', () => {
    const { getAllByText } = render(<FamilyMembers familyMembers={MOCK_FAMILY_MEMBERS} />);
    const twoElements = getAllByText('2');
    expect(twoElements.length).toBeGreaterThanOrEqual(1);
    
    // Vérifie les statistiques rapides
    expect(getAllByText('Membres')).toBeTruthy(); 
    expect(getAllByText('Appareils')).toBeTruthy(); 
    expect(getAllByText('En ligne')).toBeTruthy(); 
  });
  it('navigates to ModifyRole screen when "Modifier Rôle" button is pressed', () => {
    const { getAllByText } = render(<FamilyMembers familyMembers={MOCK_FAMILY_MEMBERS} />);
    
    const modifyRoleButtons = getAllByText('Modifier Rôle')[0];
    fireEvent.press(modifyRoleButtons);
    
    // Vérifie que useRouter().push a été appelé avec les bons paramètres pour Alice Smith
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/family/ModifyRole',
      params: {
        idUser: 'u1',
        idFamily: 'f1',
        name: 'Alice Smith',
        role: 'Tuteur',
      },
    });
  });

  it('navigates to home when "Retour à l\'accueil" link is pressed', () => {
    const { getByText } = render(<FamilyMembers familyMembers={MOCK_FAMILY_MEMBERS} />);
    
    const backLink = getByText('Retour à l\'accueil');
    fireEvent.press(backLink);
    
    // Vérifie que useRouter().push a été appelé pour la navigation via le Link
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});