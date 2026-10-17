export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WORLD_WIDTH = 5240;

export const PLAYER = {
  maxHealth: 3,
  moveSpeed: 280,
  jumpSpeed: 610,
  coyoteTimeMs: 110,
  jumpBufferMs: 130,
  attackCooldownMs: 320,
  invulnerabilityMs: 900,
} as const;

export const COLORS = {
  ink: 0x11162d,
  night: 0x171b3d,
  dusk: 0x5d4288,
  ember: 0xff6b45,
  gold: 0xffd36a,
  mint: 0x68e0c1,
  stone: 0x303a59,
  stoneTop: 0x68738f,
  white: 0xfff8e8,
} as const;

