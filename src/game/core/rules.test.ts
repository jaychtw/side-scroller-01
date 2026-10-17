import { describe, expect, it } from 'vitest';
import { applyDamage, canOpenExit, getRunState } from './rules';

describe('game rules', () => {
  it('never lets damage reduce health below zero', () => {
    expect(applyDamage(3)).toBe(2);
    expect(applyDamage(1, 4)).toBe(0);
  });

  it('opens the exit only after every enemy is defeated', () => {
    expect(canOpenExit(1)).toBe(false);
    expect(canOpenExit(0)).toBe(true);
  });

  it('prioritizes defeat over reaching the exit', () => {
    expect(getRunState(0, true)).toBe('lost');
    expect(getRunState(1, true)).toBe('won');
    expect(getRunState(1, false)).toBe('playing');
  });
});

