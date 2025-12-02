import { describe, it, expect } from '@jest/globals';

const sum = (a: number, b: number) => a + b;

describe('sum', () => {
  it('adds numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});