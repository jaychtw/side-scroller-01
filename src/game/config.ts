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
  ink: 0x173533,
  deepTeal: 0x075b5b,
  teal: 0x079a8c,
  sky: 0x11b5c9,
  leaf: 0x41a448,
  leafLight: 0x8bc642,
  sunGold: 0xffc117,
  cream: 0xf7f4e8,
  glass: 0xbdebe5,
  concrete: 0xd8d8c8,
  asphalt: 0x3f5552,
} as const;

