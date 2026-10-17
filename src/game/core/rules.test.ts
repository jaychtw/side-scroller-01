import { describe, expect, it } from 'vitest';
import { applyDamage, canOpenExit, getRunState, shouldSpawnMiniBoss } from './rules';

describe('game rules', () => {
  it('never lets damage reduce health below zero', () => {
    expect(applyDamage(3)).toBe(2);
    expect(applyDamage(1, 4)).toBe(0);
  });

  it('spawns one mini-boss after each group of five ghosts', () => {
    expect(shouldSpawnMiniBoss(4, 0)).toBe(false);
    expect(shouldSpawnMiniBoss(5, 0)).toBe(true);
    expect(shouldSpawnMiniBoss(5, 1)).toBe(false);
    expect(shouldSpawnMiniBoss(10, 1)).toBe(true);
  });

  it('opens the exit only after the ghosts and mini-boss are defeated', () => {
    expect(canOpenExit({ ghostsRemaining: 1, miniBossDefeated: true })).toBe(false);
    expect(canOpenExit({ ghostsRemaining: 0, miniBossDefeated: false })).toBe(false);
    expect(canOpenExit({ ghostsRemaining: 0, miniBossDefeated: true })).toBe(true);
  });

  it('prioritizes defeat over reaching the exit', () => {
    expect(getRunState(0, true)).toBe('lost');
    expect(getRunState(1, true)).toBe('won');
    expect(getRunState(1, false)).toBe('playing');
  });
});

