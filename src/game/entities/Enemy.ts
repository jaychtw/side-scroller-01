import Phaser from 'phaser';

export interface EnemyConfig {
  x: number;
  y: number;
  patrolMin: number;
  patrolMax: number;
  onDefeated: (enemy: Enemy) => void;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private health = 2;
  private direction: -1 | 1 = -1;
  private readonly patrolMin: number;
  private readonly patrolMax: number;
  private readonly onDefeated: (enemy: Enemy) => void;
  private stunnedUntil = 0;
  private defeated = false;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    super(scene, config.x, config.y, 'enemy');
    this.patrolMin = config.patrolMin;
    this.patrolMax = config.patrolMax;
    this.onDefeated = config.onDefeated;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(false);
    this.setDepth(12);
    this.setSize(34, 34).setOffset(5, 9);
    this.setVelocityX(-85);
  }

  update(time: number): void {
    if (this.defeated || !this.active) return;

    if (this.x <= this.patrolMin) this.direction = 1;
    if (this.x >= this.patrolMax) this.direction = -1;

    if (time >= this.stunnedUntil) {
      this.setVelocityX(85 * this.direction);
    }
    this.setFlipX(this.direction > 0);
  }

  takeHit(fromDirection: -1 | 1, time: number): void {
    if (this.defeated || time < this.stunnedUntil) return;

    this.health -= 1;
    this.stunnedUntil = time + 180;
    this.setVelocity(230 * fromDirection, -170);
    this.setTint(0xfff1b8);
    this.scene.time.delayedCall(110, () => {
      if (this.active) this.clearTint();
    });

    if (this.health <= 0) this.defeat(fromDirection);
  }

  isDefeated(): boolean {
    return this.defeated;
  }

  private defeat(fromDirection: -1 | 1): void {
    this.defeated = true;
    this.body.enable = false;
    this.setVelocity(160 * fromDirection, -260);
    this.onDefeated(this);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 80 * fromDirection,
      y: this.y - 35,
      duration: 360,
      ease: 'Cubic.easeIn',
      onComplete: () => this.destroy(),
    });
  }
}

