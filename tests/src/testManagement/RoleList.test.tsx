import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoleList } from '../../../src/components/RoleListe'; 

// --- MOCK DES DÉPENDANCES ---

jest.mock('../../../src/styles/FamilyManagementStyle', () => ({
  stylesFamily: {
    roleItem: {},
    roleText: {},
  },
}));


const mockGetUpperName = jest.fn((role) => role.toUpperCase());


// DONNÉES DE TEST

const MOCK_ROLES = [
  { id: '1', role: 'tuteur' },
  { id: '2', role: 'enfant' },
  { id: '3', role: 'membre' },
  { id: '4', role: 'tuteur secondaire' },
];

const mockOnSelect = jest.fn();



describe('RoleList Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUpperName.mockImplementation((role) => role.toUpperCase());
  });

  it('should render all roles in the list and use getUpperName', () => {
    // Rendu du composant
    const { getByText } = render(
      <RoleList 
        list={MOCK_ROLES} 
        onSelect={mockOnSelect} 
        getUpperName={mockGetUpperName}
      />,
    );

    expect(getByText('TUTEUR')).toBeTruthy();
    expect(getByText('ENFANT')).toBeTruthy();
    expect(getByText('MEMBRE')).toBeTruthy();
    expect(getByText('TUTEUR SECONDAIRE')).toBeTruthy();

    //Vérifie que la fonction utilitaire a été appelée pour chaque élément
    expect(mockGetUpperName).toHaveBeenCalledTimes(MOCK_ROLES.length);
    expect(mockGetUpperName).toHaveBeenCalledWith('tuteur');
    expect(mockGetUpperName).toHaveBeenCalledWith('enfant');
  });

  it('should call onSelect with the correct role when an item is pressed', () => {
    const { getByText } = render(
      <RoleList 
        list={MOCK_ROLES} 
        onSelect={mockOnSelect} 
        getUpperName={mockGetUpperName}
      />,
    );

    const enfantItem = getByText('ENFANT');

    fireEvent.press(enfantItem);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('enfant');

  });

  it('should handle an empty list without crashing', () => {
    const { queryByText } = render(
      <RoleList 
        list={[]} 
        onSelect={mockOnSelect} 
        getUpperName={mockGetUpperName}
      />,
    );
        
    // Vérifie qu'aucun rôle n'est affiché et qu'il n'y a pas d'erreur
    expect(queryByText('TUTEUR')).toBeNull();
    expect(mockGetUpperName).not.toHaveBeenCalled();
  });
});