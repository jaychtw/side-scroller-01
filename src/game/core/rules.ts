export type RunState = 'playing' | 'won' | 'lost';

export interface QuestProgress {
  ghostsRemaining: number;
  miniBossDefeated: boolean;
}

export function applyDamage(currentHealth: number, amount = 1): number {
  return Math.max(0, currentHealth - Math.max(0, amount));
}

export function shouldSpawnMiniBoss(ghostsDefeated: number, bossesSpawned: number): boolean {
  return ghostsDefeated > 0 && Math.floor(ghostsDefeated / 5) > bossesSpawned;
}

export function canOpenExit(progress: QuestProgress): boolean {
  return progress.ghostsRemaining <= 0 && progress.miniBossDefeated;
}

export function getRunState(health: number, reachedOpenExit: boolean): RunState {
  if (health <= 0) return 'lost';
  if (reachedOpenExit) return 'won';
  return 'playing';
}

