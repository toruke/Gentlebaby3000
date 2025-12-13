import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ExampleScreen from '../../src/components/ExampleScreen';

describe('ExampleScreen – Integration Test', () => {
  it('should display submitted text after pressing the button', () => {
    const { getByTestId, getByText } = render(<ExampleScreen />);

    const input = getByTestId('input');
    const button = getByText('Submit');

    // L’utilisateur tape un texte
    fireEvent.changeText(input, 'Hello World');

    // L’utilisateur appuie sur le bouton
    fireEvent.press(button);

    // Le texte est affiché à l'écran
    const result = getByTestId('result');
    expect(result.props.children).toBe('Hello World');
  });
});