import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, WORLD_WIDTH } from '../config';
import { canOpenExit, getRunState } from '../core/rules';
import { Enemy, type EnemyConfig } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { Hud } from '../ui/Hud';

interface PlatformSpec {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class GameScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Player;
  private enemies: Enemy[] = [];
  private hud!: Hud;
  private gate!: Phaser.Physics.Arcade.Image;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private checkpoint = { x: 150, y: 480 };
  private ended = false;
  private runStartedAt = 0;
  private gateHintReadyAt = 0;

  constructor() {
    super('game');
  }

  create(): void {
    this.ended = false;
    this.enemies = [];
    this.checkpoint = { x: 150, y: 480 };
    this.runStartedAt = this.time.now;
    this.gateHintReadyAt = 0;

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT + 180);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#191c3d');

    this.createBackdrop();
    this.platforms = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();
    this.createLevel();

    this.hud = new Hud(this);
    this.player = new Player(this, 150, 480, {
      onAttack: (area, direction) => this.resolveAttack(area, direction),
      onHealthChanged: (health) => this.hud.setHealth(health),
      onDeath: () => this.endRun(false),
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.hazards, () => this.hitHazard());
    this.physics.add.overlap(this.player, this.gate, () => this.tryExit());

    this.spawnEnemies();
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09, -220, 65);
    this.cameras.main.setDeadzone(180, 110);
    this.cameras.main.fadeIn(350, 12, 14, 31);

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is required to play Emberfall.');
    this.restartKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.hud.setEnemiesRemaining(this.enemies.length);
  }

  update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }

    if (this.ended) return;

    this.player.update(time);
    this.enemies.forEach((enemy) => enemy.update(time));

    if (this.player.y > GAME_HEIGHT + 90) this.fallIntoPit();

    if (this.player.x > 1830) this.checkpoint = { x: 1740, y: 430 };
    if (this.player.x > 3570) this.checkpoint = { x: 3500, y: 400 };
  }

  private createBackdrop(): void {
    this.add.rectangle(WORLD_WIDTH / 2, GAME_HEIGHT / 2, WORLD_WIDTH, GAME_HEIGHT, COLORS.night);

    for (let x = 90; x < WORLD_WIDTH; x += 260) {
      const starY = 120 + ((x * 17) % 220);
      this.add.circle(x, starY, x % 3 === 0 ? 2 : 1, COLORS.gold, 0.42).setScrollFactor(0.3);
    }

    this.add.circle(990, 170, 92, 0xffdca0, 0.1).setScrollFactor(0.12);
    this.add.circle(990, 170, 64, 0xffe5ad, 0.13).setScrollFactor(0.12);

    for (let x = -300; x < WORLD_WIDTH + 700; x += 610) {
      this.add
        .triangle(x, 585, 0, 360, 330, 15, 660, 360, 0x272b53, 0.86)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.22);
      this.add
        .triangle(x + 290, 620, 0, 310, 260, 40, 540, 310, 0x202544, 0.9)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.36);
    }

    for (let x = 120; x < WORLD_WIDTH; x += 430) {
      this.add.rectangle(x, 560, 18, 170, 0x151a34, 0.75).setOrigin(0.5, 1).setScrollFactor(0.58);
      this.add.circle(x, 398, 62, 0x252a4b, 0.8).setScrollFactor(0.58);
      this.add.circle(x - 42, 424, 45, 0x202646, 0.86).setScrollFactor(0.58);
      this.add.circle(x + 45, 426, 48, 0x202646, 0.86).setScrollFactor(0.58);
    }

    this.add.rectangle(WORLD_WIDTH / 2, 660, WORLD_WIDTH, 140, 0x0d1025, 0.7).setScrollFactor(0.75);
  }

  private createLevel(): void {
    const platforms: PlatformSpec[] = [
      { x: 360, y: 650, width: 720, height: 90 },
      { x: 930, y: 610, width: 260, height: 45 },
      { x: 1280, y: 650, width: 350, height: 90 },
      { x: 1580, y: 555, width: 190, height: 36 },
      { x: 1900, y: 620, width: 420, height: 50 },
      { x: 2240, y: 520, width: 180, height: 36 },
      { x: 2520, y: 650, width: 410, height: 90 },
      { x: 2820, y: 540, width: 170, height: 36 },
      { x: 3100, y: 460, width: 190, height: 36 },
      { x: 3370, y: 650, width: 370, height: 90 },
      { x: 3680, y: 560, width: 190, height: 36 },
      { x: 4000, y: 650, width: 430, height: 90 },
      { x: 4330, y: 530, width: 180, height: 36 },
      { x: 4760, y: 650, width: 650, height: 90 },
    ];

    platforms.forEach((spec) => this.addPlatform(spec));

    [700, 1450, 2075, 2685, 3490, 4160].forEach((x) => {
      const spikes = this.hazards.create(x, 590, 'spikes') as Phaser.Physics.Arcade.Image;
      spikes.setDepth(9).refreshBody();
    });

    this.gate = this.physics.add.staticImage(5000, 568, 'gate-closed').setDepth(10);
    this.gate.setSize(70, 78).refreshBody();

    this.add
      .text(94, 546, 'THE ASHEN PASS', {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#aab4ce',
        letterSpacing: 3,
      })
      .setDepth(8);
  }

  private addPlatform(spec: PlatformSpec): void {
    const platform = this.platforms.create(spec.x, spec.y, 'ground') as Phaser.Physics.Arcade.Image;
    platform.setDisplaySize(spec.width, spec.height).setDepth(8).refreshBody();
  }

  private spawnEnemies(): void {
    const specs: Omit<EnemyConfig, 'onDefeated'>[] = [
      { x: 480, y: 555, patrolMin: 360, patrolMax: 610 },
      { x: 1260, y: 555, patrolMin: 1150, patrolMax: 1390 },
      { x: 1910, y: 545, patrolMin: 1760, patrolMax: 2040 },
      { x: 2540, y: 555, patrolMin: 2390, patrolMax: 2660 },
      { x: 3970, y: 555, patrolMin: 3830, patrolMax: 4130 },
    ];

    specs.forEach((spec) => {
      const enemy = new Enemy(this, {
        ...spec,
        onDefeated: (defeatedEnemy) => this.onEnemyDefeated(defeatedEnemy),
      });
      this.enemies.push(enemy);
      this.physics.add.collider(enemy, this.platforms);
      this.physics.add.overlap(this.player, enemy, () => {
        if (!enemy.isDefeated()) this.player.takeDamage(enemy.x, this.time.now);
      });
    });
  }

  private resolveAttack(area: Phaser.Geom.Rectangle, direction: -1 | 1): void {
    this.enemies.forEach((enemy) => {
      if (!enemy.active || enemy.isDefeated()) return;
      const bounds = enemy.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(area, bounds)) {
        enemy.takeHit(direction, this.time.now);
      }
    });
  }

  private onEnemyDefeated(_enemy: Enemy): void {
    const remaining = this.enemies.filter((enemy) => !enemy.isDefeated()).length;
    this.hud.setEnemiesRemaining(remaining);
    this.cameras.main.shake(90, 0.0025);

    if (canOpenExit(remaining)) {
      this.gate.setTexture('gate-open');
      this.hud.flashMessage('THE EMBER GATE IS OPEN');
      this.tweens.add({ targets: this.gate, alpha: 0.58, yoyo: true, repeat: -1, duration: 700 });
    }
  }

  private hitHazard(): void {
    if (this.player.takeDamage(this.player.x, this.time.now)) {
      this.cameras.main.shake(130, 0.004);
      this.time.delayedCall(160, () => {
        if (!this.ended && this.player.getHealth() > 0) {
          this.player.restoreAt(this.checkpoint.x, this.checkpoint.y);
        }
      });
    }
  }

  private fallIntoPit(): void {
    if (this.player.takeDamage(this.player.x, this.time.now)) {
      if (this.player.getHealth() <= 0) return;
      this.cameras.main.fadeOut(110, 20, 12, 24);
      this.time.delayedCall(160, () => {
        if (!this.ended && this.player.getHealth() > 0) {
          this.player.restoreAt(this.checkpoint.x, this.checkpoint.y);
          this.cameras.main.fadeIn(180, 20, 12, 24);
        }
      });
    }
  }

  private tryExit(): void {
    const remaining = this.enemies.filter((enemy) => !enemy.isDefeated()).length;
    const state = getRunState(this.player.getHealth(), canOpenExit(remaining));
    if (state === 'won') {
      this.endRun(true);
    } else if (!this.ended && this.time.now >= this.gateHintReadyAt) {
      this.gateHintReadyAt = this.time.now + 1500;
      this.hud.flashMessage(`${remaining} SENTINEL${remaining === 1 ? '' : 'S'} STILL BIND THE GATE`);
    }
  }

  private endRun(won: boolean): void {
    if (this.ended) return;
    this.ended = true;
    this.player.lockControls();
    this.physics.world.pause();
    const elapsedSeconds = (this.time.now - this.runStartedAt) / 1000;
    this.hud.showEndState(this, won, elapsedSeconds);
  }
}

