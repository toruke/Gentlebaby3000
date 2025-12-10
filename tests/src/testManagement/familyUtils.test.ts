import { describe, it, expect } from '@jest/globals';
import { getStatusColor, getStatusText, getRoleColor, getUpperName } from '@/src/utils/familyUtils';

describe('getStatusColor', () => {
  it('returns correct color for connected status', () => {
    expect(getStatusColor('connected')).toBe('#48bb78');
  });
  it('returns correct color for disconnected status', () => {
    expect(getStatusColor('disconnected')).toBe('#e53e3e');
  });
  it('returns default color for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('#a0aec0');
  });
});

describe('getStatusText', () => {
  it('returns correct text for connected status', () => {
    expect(getStatusText('connected')).toBe('Connecté');
  });
  it('returns correct text for disconnected status', () => {
    expect(getStatusText('disconnected')).toBe('Déconnecté');
  });
  it('returns default text for unknown status', () => {
    expect(getStatusText('unknown')).toBe('Inconnu');
  });
});

describe('getRoleColor', () => {
  it('returns correct color for Tuteur role', () => {
    expect(getRoleColor('Tuteur')).toBe('#6b46c1');
  });
  it('returns correct color for Membre role', () => {
    expect(getRoleColor('Membre')).toBe('#38a169');
  });
  it('returns correct color for Enfant role', () => {
    expect(getRoleColor('Enfant')).toBe('#4299e1');
  });
  it('returns default color for unknown role', () => {
    expect(getRoleColor('unknown')).toBe('#718096');
  });
});

describe('getUpperName', () => {
  it('returns the name in uppercase', () => {
    expect(getUpperName('jean')).toBe('Jean');
  });
  it('returns the name unchanged if first letter is already uppercase', () => {
    expect(getUpperName('Marie')).toBe('Marie');
  });
  it('handles empty string', () => {
    expect(getUpperName('')).toBe('');
  });
  it('returns the name unchanged if it starts with a number', () => {
    expect(getUpperName('123abc')).toBe('123abc');
  });
});