export type RunState = 'playing' | 'won' | 'lost';

export function applyDamage(currentHealth: number, amount = 1): number {
  return Math.max(0, currentHealth - Math.max(0, amount));
}

export function canOpenExit(enemiesRemaining: number): boolean {
  return enemiesRemaining <= 0;
}

export function getRunState(health: number, reachedOpenExit: boolean): RunState {
  if (health <= 0) return 'lost';
  if (reachedOpenExit) return 'won';
  return 'playing';
}

