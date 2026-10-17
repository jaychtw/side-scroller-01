import Phaser from 'phaser';
import { PLAYER } from '../config';
import { applyDamage } from '../core/rules';

interface PlayerCallbacks {
  onAttack: (area: Phaser.Geom.Rectangle, direction: -1 | 1) => void;
  onHealthChanged: (health: number) => void;
  onDeath: () => void;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly leftKey: Phaser.Input.Keyboard.Key;
  private readonly rightKey: Phaser.Input.Keyboard.Key;
  private readonly jumpKey: Phaser.Input.Keyboard.Key;
  private readonly attackJKey: Phaser.Input.Keyboard.Key;
  private readonly attackXKey: Phaser.Input.Keyboard.Key;
  private readonly callbacks: PlayerCallbacks;
  private facing: -1 | 1 = 1;
  private health: number = PLAYER.maxHealth;
  private lastGroundedAt = 0;
  private jumpBufferedUntil = 0;
  private attackReadyAt = 0;
  private invulnerableUntil = 0;
  private controlsEnabled = true;

  constructor(scene: Phaser.Scene, x: number, y: number, callbacks: PlayerCallbacks) {
    super(scene, x, y, 'player');
    this.callbacks = callbacks;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(72, 72);
    this.body.setSize(96, 178);
    this.body.setOffset(80, 66);
    this.setDepth(14);
    this.setCollideWorldBounds(true);
    this.setMaxVelocity(PLAYER.moveSpeed, 900);

    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is required to play Formosa Quest.');

    this.cursors = keyboard.createCursorKeys();
    this.leftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.jumpKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.attackJKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.attackXKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  update(time: number): void {
    if (!this.controlsEnabled) {
      this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, 0, 0.18));
      return;
    }

    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded) this.lastGroundedAt = time;

    const moveLeft = this.cursors.left.isDown || this.leftKey.isDown;
    const moveRight = this.cursors.right.isDown || this.rightKey.isDown;
    const direction = Number(moveRight) - Number(moveLeft);

    if (direction !== 0) {
      this.facing = direction < 0 ? -1 : 1;
      this.setVelocityX(direction * PLAYER.moveSpeed);
      this.setFlipX(this.facing < 0);
    } else {
      this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, 0, grounded ? 0.28 : 0.08));
    }

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.jumpKey);
    if (jumpPressed) this.jumpBufferedUntil = time + PLAYER.jumpBufferMs;

    const canUseCoyoteTime = time - this.lastGroundedAt <= PLAYER.coyoteTimeMs;
    if (this.jumpBufferedUntil >= time && canUseCoyoteTime) {
      this.setVelocityY(-PLAYER.jumpSpeed);
      this.jumpBufferedUntil = 0;
      this.lastGroundedAt = -Infinity;
    }

    const jumpHeld = this.cursors.up.isDown || this.cursors.space.isDown || this.jumpKey.isDown;
    if (!jumpHeld && this.body.velocity.y < -230) this.setVelocityY(-230);

    if (
      time >= this.attackReadyAt &&
      (Phaser.Input.Keyboard.JustDown(this.attackJKey) ||
        Phaser.Input.Keyboard.JustDown(this.attackXKey))
    ) {
      this.attack(time);
    }
  }

  takeDamage(sourceX: number, time: number): boolean {
    if (!this.controlsEnabled || time < this.invulnerableUntil) return false;

    this.health = applyDamage(this.health);
    this.invulnerableUntil = time + PLAYER.invulnerabilityMs;
    const knockbackDirection = this.x < sourceX ? -1 : 1;
    this.setVelocity(300 * knockbackDirection, -330);
    this.callbacks.onHealthChanged(this.health);

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 75,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.setAlpha(1),
    });

    if (this.health <= 0) {
      this.controlsEnabled = false;
      this.setTint(0x5b627c);
      this.callbacks.onDeath();
    }
    return true;
  }

  restoreAt(x: number, y: number): void {
    if (this.health <= 0) return;
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setAlpha(1);
  }

  lockControls(): void {
    this.controlsEnabled = false;
    this.setVelocityX(0);
  }

  getHealth(): number {
    return this.health;
  }

  private attack(time: number): void {
    this.attackReadyAt = time + PLAYER.attackCooldownMs;
    const attackWidth = 86;
    const attackHeight = 54;
    const centerX = this.x + this.facing * 48;
    const area = new Phaser.Geom.Rectangle(
      centerX - attackWidth / 2,
      this.y - attackHeight / 2,
      attackWidth,
      attackHeight,
    );

    const slash = this.scene.add
      .sprite(centerX, this.y, 'slash')
      .setDepth(13)
      .setFlipX(this.facing < 0)
      .setAngle(this.facing < 0 ? -8 : 8)
      .setAlpha(0.95);
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.35,
      scaleY: 1.25,
      duration: 135,
      onComplete: () => slash.destroy(),
    });

    this.callbacks.onAttack(area, this.facing);
  }
}

