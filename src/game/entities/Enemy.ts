import Phaser from 'phaser';

export type EnemyKind = 'ghost' | 'boss';

export interface EnemyConfig {
  x: number;
  y: number;
  patrolMin: number;
  patrolMax: number;
  kind: EnemyKind;
  textureKey: string;
  health: number;
  speed: number;
  displayWidth: number;
  displayHeight: number;
  bodyWidth: number;
  bodyHeight: number;
  bodyOffsetX: number;
  bodyOffsetY: number;
  floating?: boolean;
  onHealthChanged?: (enemy: Enemy, health: number) => void;
  onDefeated: (enemy: Enemy) => void;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private health: number;
  private direction: -1 | 1 = -1;
  private readonly kind: EnemyKind;
  private readonly speed: number;
  private readonly patrolMin: number;
  private readonly patrolMax: number;
  private readonly floating: boolean;
  private readonly floatPhase: number;
  private readonly onHealthChanged?: (enemy: Enemy, health: number) => void;
  private readonly onDefeated: (enemy: Enemy) => void;
  private stunnedUntil = 0;
  private defeated = false;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    super(scene, config.x, config.y, config.textureKey);
    this.kind = config.kind;
    this.health = config.health;
    this.speed = config.speed;
    this.patrolMin = config.patrolMin;
    this.patrolMax = config.patrolMax;
    this.floating = config.floating ?? false;
    this.floatPhase = config.x * 0.013;
    this.onHealthChanged = config.onHealthChanged;
    this.onDefeated = config.onDefeated;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(config.displayWidth, config.displayHeight);
    this.body.setSize(config.bodyWidth, config.bodyHeight);
    this.body.setOffset(config.bodyOffsetX, config.bodyOffsetY);
    this.body.setAllowGravity(!this.floating);
    this.setCollideWorldBounds(false);
    this.setDepth(this.kind === 'boss' ? 14 : 12);
    this.setVelocityX(-this.speed);
  }

  update(time: number): void {
    if (this.defeated || !this.active) return;

    if (this.x <= this.patrolMin) this.direction = 1;
    if (this.x >= this.patrolMax) this.direction = -1;

    if (time >= this.stunnedUntil) {
      this.setVelocityX(this.speed * this.direction);
      if (this.floating) this.setVelocityY(Math.sin(time / 330 + this.floatPhase) * 22);
    }
    this.setFlipX(this.direction > 0);
  }

  takeHit(fromDirection: -1 | 1, time: number): void {
    if (this.defeated || time < this.stunnedUntil) return;

    this.health -= 1;
    this.stunnedUntil = time + 180;
    this.setVelocity(230 * fromDirection, this.floating ? -60 : -170);
    this.setTint(0xfff2a6);
    this.onHealthChanged?.(this, this.health);
    this.scene.time.delayedCall(110, () => {
      if (this.active) this.clearTint();
    });

    if (this.health <= 0) this.defeat(fromDirection);
  }

  getKind(): EnemyKind {
    return this.kind;
  }

  getHealth(): number {
    return this.health;
  }

  isDefeated(): boolean {
    return this.defeated;
  }

  private defeat(fromDirection: -1 | 1): void {
    this.defeated = true;
    this.body.enable = false;
    this.onDefeated(this);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: this.kind === 'boss' ? 12 * fromDirection : 70 * fromDirection,
      scaleX: this.scaleX * 0.82,
      scaleY: this.scaleY * 0.82,
      y: this.y - (this.kind === 'boss' ? 18 : 35),
      duration: this.kind === 'boss' ? 520 : 340,
      ease: 'Cubic.easeIn',
      onComplete: () => this.destroy(),
    });
  }
}

