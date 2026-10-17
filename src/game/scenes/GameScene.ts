import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, WORLD_WIDTH } from '../config';
import { canOpenExit, getRunState, shouldSpawnMiniBoss } from '../core/rules';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { Hud } from '../ui/Hud';

interface PlatformSpec {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GHOST_COUNT = 5;
const BOSS_HEALTH = 3;

export class GameScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Player;
  private combatants: Enemy[] = [];
  private hud!: Hud;
  private gate!: Phaser.Physics.Arcade.Image;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private checkpoint = { x: 150, y: 480 };
  private ghostsRemaining = GHOST_COUNT;
  private miniBossSpawned = false;
  private miniBossDefeated = false;
  private ended = false;
  private runStartedAt = 0;
  private gateHintReadyAt = 0;

  constructor() {
    super('game');
  }

  create(): void {
    this.ended = false;
    this.combatants = [];
    this.ghostsRemaining = GHOST_COUNT;
    this.miniBossSpawned = false;
    this.miniBossDefeated = false;
    this.checkpoint = { x: 150, y: 480 };
    this.runStartedAt = this.time.now;
    this.gateHintReadyAt = 0;

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT + 180);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#11b5c9');

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

    this.spawnGhosts();
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09, -220, 65);
    this.cameras.main.setDeadzone(180, 110);
    this.cameras.main.fadeIn(350, 247, 244, 232);

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is required to play Formosa Quest.');
    this.restartKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.hud.setGhostsRemaining(this.ghostsRemaining);
  }

  update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }

    if (this.ended) return;

    this.player.update(time);
    this.combatants.forEach((enemy) => enemy.update(time));

    if (this.player.y > GAME_HEIGHT + 90) this.fallIntoPit();

    if (this.player.x > 1830) this.checkpoint = { x: 1740, y: 430 };
    if (this.player.x > 3570) this.checkpoint = { x: 3500, y: 400 };
  }

  private createBackdrop(): void {
    this.add.rectangle(WORLD_WIDTH / 2, GAME_HEIGHT / 2, WORLD_WIDTH, GAME_HEIGHT, COLORS.sky).setDepth(-10);
    this.add
      .rectangle(WORLD_WIDTH / 2, 430, WORLD_WIDTH, 330, COLORS.cream, 0.26)
      .setDepth(-9);

    this.add.circle(1010, 160, 76, COLORS.sunGold, 0.94).setScrollFactor(0.08).setDepth(-8);
    this.add.circle(1010, 160, 98, COLORS.cream, 0.18).setScrollFactor(0.08).setDepth(-9);

    for (let x = 120; x < WORLD_WIDTH + 1200; x += 610) {
      const y = 145 + ((x * 7) % 90);
      this.add.ellipse(x, y, 126, 42, COLORS.cream, 0.84).setScrollFactor(0.14).setDepth(-7);
      this.add.circle(x - 42, y - 10, 28, COLORS.cream, 0.9).setScrollFactor(0.14).setDepth(-7);
      this.add.circle(x + 30, y - 13, 34, COLORS.cream, 0.9).setScrollFactor(0.14).setDepth(-7);
    }

    for (let x = -260; x < WORLD_WIDTH + 1200; x += 560) {
      this.add
        .triangle(x, 565, 0, 330, 300, 20, 620, 330, COLORS.leaf, 0.36)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.2)
        .setDepth(-6);
      this.add
        .triangle(x + 310, 585, 0, 280, 270, 35, 560, 280, COLORS.teal, 0.34)
        .setOrigin(0.5, 1)
        .setScrollFactor(0.26)
        .setDepth(-6);
    }

    this.createTaipeiTower(1000, 575, 0.31);

    for (let x = -100; x < WORLD_WIDTH + 1200; x += 145) {
      const height = 115 + ((x * 13 + 470) % 145);
      const width = 105 + ((x * 5 + 80) % 42);
      const fill = x % 3 === 0 ? COLORS.glass : x % 2 === 0 ? 0xa8d9d0 : 0xc8ded4;
      this.createCityBuilding(x, 606, width, height, fill, 0.38, false);
    }

    for (let x = 80; x < WORLD_WIDTH + 900; x += 245) {
      const height = 165 + ((x * 11) % 125);
      const fill = x % 2 === 0 ? 0x78bda9 : 0x90c8a5;
      this.createCityBuilding(x, 625, 190, height, fill, 0.58, true);
    }

    for (let x = 180; x < WORLD_WIDTH + 700; x += 520) {
      this.add.rectangle(x, 590, 12, 145, COLORS.deepTeal, 0.72).setOrigin(0.5, 1).setScrollFactor(0.74).setDepth(-1);
      this.add.circle(x - 32, 454, 44, COLORS.leaf, 0.92).setScrollFactor(0.74).setDepth(-1);
      this.add.circle(x + 29, 458, 49, COLORS.leafLight, 0.9).setScrollFactor(0.74).setDepth(-1);
      this.add.circle(x, 430, 54, COLORS.leaf, 0.94).setScrollFactor(0.74).setDepth(-1);
    }

    this.add.rectangle(WORLD_WIDTH / 2, 676, WORLD_WIDTH, 88, COLORS.asphalt, 0.92).setDepth(0);
    for (let x = 90; x < WORLD_WIDTH; x += 220) {
      this.add.rectangle(x, 657, 92, 6, COLORS.sunGold, 0.72).setDepth(1);
    }
  }

  private createTaipeiTower(x: number, bottom: number, scrollFactor: number): void {
    this.add.rectangle(x, bottom - 47, 84, 94, COLORS.deepTeal, 0.46).setScrollFactor(scrollFactor).setDepth(-5);
    for (let level = 0; level < 7; level += 1) {
      const width = 76 - level * 5;
      this.add
        .rectangle(x, bottom - 100 - level * 37, width, 31, COLORS.teal, 0.66)
        .setStrokeStyle(2, COLORS.cream, 0.35)
        .setScrollFactor(scrollFactor)
        .setDepth(-5);
    }
    this.add.rectangle(x, bottom - 380, 8, 90, COLORS.deepTeal, 0.68).setScrollFactor(scrollFactor).setDepth(-5);
    this.add.circle(x, bottom - 429, 7, COLORS.sunGold, 0.75).setScrollFactor(scrollFactor).setDepth(-5);
  }

  private createCityBuilding(
    x: number,
    bottom: number,
    width: number,
    height: number,
    color: number,
    scrollFactor: number,
    detailed: boolean,
  ): void {
    const top = bottom - height;
    this.add
      .rectangle(x, top, width, height, color, 0.92)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, COLORS.deepTeal, 0.22)
      .setScrollFactor(scrollFactor)
      .setDepth(-4);

    const columns = detailed ? 4 : 3;
    const rows = detailed ? 5 : 4;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const windowX = x - width * 0.33 + column * ((width * 0.66) / Math.max(1, columns - 1));
        const windowY = top + 28 + row * ((height - 52) / Math.max(1, rows - 1));
        this.add
          .rectangle(windowX, windowY, detailed ? 20 : 14, detailed ? 14 : 10, COLORS.cream, row % 3 === 0 ? 0.8 : 0.48)
          .setScrollFactor(scrollFactor)
          .setDepth(-3);
      }
    }

    if (detailed) {
      this.add.rectangle(x + width * 0.38, top + 54, 18, 76, COLORS.sunGold, 0.9).setScrollFactor(scrollFactor).setDepth(-2);
      this.add.ellipse(x - width * 0.28, top - 9, 52, 20, COLORS.teal, 0.85).setScrollFactor(scrollFactor).setDepth(-3);
      this.add.rectangle(x - width * 0.28, top - 3, 45, 18, COLORS.deepTeal, 0.68).setScrollFactor(scrollFactor).setDepth(-3);
    }
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
      const hazard = this.hazards.create(x, 590, 'spikes') as Phaser.Physics.Arcade.Image;
      hazard.setDepth(9).refreshBody();
    });

    this.gate = this.physics.add.staticImage(5000, 568, 'gate-closed').setDepth(10);
    this.gate.setSize(70, 78).refreshBody();

    this.add
      .text(94, 546, 'FORMOSA GREENWAY  •  CITY ROUTE 01', {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#173533',
        letterSpacing: 2,
      })
      .setDepth(8);
  }

  private addPlatform(spec: PlatformSpec): void {
    const platform = this.platforms.create(spec.x, spec.y, 'ground') as Phaser.Physics.Arcade.Image;
    platform.setDisplaySize(spec.width, spec.height).setDepth(8).refreshBody();
  }

  private spawnGhosts(): void {
    const specs = [
      { x: 480, y: 535, patrolMin: 360, patrolMax: 610 },
      { x: 1260, y: 535, patrolMin: 1150, patrolMax: 1390 },
      { x: 1910, y: 525, patrolMin: 1760, patrolMax: 2040 },
      { x: 2540, y: 535, patrolMin: 2390, patrolMax: 2660 },
      { x: 3970, y: 535, patrolMin: 3830, patrolMax: 4130 },
    ];

    specs.forEach((spec) => {
      const ghost = new Enemy(this, {
        ...spec,
        kind: 'ghost',
        textureKey: 'ghost',
        health: 1,
        speed: 72,
        displayWidth: 64,
        displayHeight: 64,
        bodyWidth: 144,
        bodyHeight: 150,
        bodyOffsetX: 56,
        bodyOffsetY: 64,
        floating: true,
        onDefeated: (enemy) => this.onEnemyDefeated(enemy),
      });
      this.registerEnemy(ghost, false);
    });
  }

  private spawnMiniBoss(): void {
    this.miniBossSpawned = true;
    const boss = new Enemy(this, {
      x: 4660,
      y: 505,
      patrolMin: 4470,
      patrolMax: 4860,
      kind: 'boss',
      textureKey: 'bear',
      health: BOSS_HEALTH,
      speed: 105,
      displayWidth: 150,
      displayHeight: 100,
      bodyWidth: 265,
      bodyHeight: 170,
      bodyOffsetX: 55,
      bodyOffsetY: 63,
      onHealthChanged: (_enemy, health) => this.hud.setBossHealth(health, BOSS_HEALTH),
      onDefeated: (enemy) => this.onEnemyDefeated(enemy),
    });
    this.registerEnemy(boss, true);
    this.hud.setBossHealth(BOSS_HEALTH, BOSS_HEALTH);
    this.hud.flashMessage('FORMOSAN BLACK BEAR APPROACHES!');
    this.cameras.main.shake(340, 0.007);
  }

  private registerEnemy(enemy: Enemy, collideWithPlatforms: boolean): void {
    this.combatants.push(enemy);
    if (collideWithPlatforms) this.physics.add.collider(enemy, this.platforms);
    this.physics.add.overlap(this.player, enemy, () => {
      if (!enemy.isDefeated()) this.player.takeDamage(enemy.x, this.time.now);
    });
  }

  private resolveAttack(area: Phaser.Geom.Rectangle, direction: -1 | 1): void {
    this.combatants.forEach((enemy) => {
      if (!enemy.active || enemy.isDefeated()) return;
      if (Phaser.Geom.Intersects.RectangleToRectangle(area, enemy.getBounds())) {
        enemy.takeHit(direction, this.time.now);
      }
    });
  }

  private onEnemyDefeated(enemy: Enemy): void {
    this.cameras.main.shake(enemy.getKind() === 'boss' ? 280 : 90, enemy.getKind() === 'boss' ? 0.007 : 0.0025);

    if (enemy.getKind() === 'ghost') {
      this.ghostsRemaining = Math.max(0, this.ghostsRemaining - 1);
      const ghostsDefeated = GHOST_COUNT - this.ghostsRemaining;
      this.hud.setGhostsRemaining(this.ghostsRemaining);
      if (shouldSpawnMiniBoss(ghostsDefeated, this.miniBossSpawned ? 1 : 0)) this.spawnMiniBoss();
      return;
    }

    this.miniBossDefeated = true;
    this.gate.setTexture('gate-open');
    this.hud.setExitOpen();
    this.hud.flashMessage('THE GREEN TRANSIT GATE IS OPEN');
    this.tweens.add({ targets: this.gate, alpha: 0.58, yoyo: true, repeat: -1, duration: 700 });
  }

  private hitHazard(): void {
    if (this.player.takeDamage(this.player.x, this.time.now)) {
      this.cameras.main.shake(130, 0.004);
      this.time.delayedCall(160, () => {
        if (!this.ended && this.player.getHealth() > 0) this.player.restoreAt(this.checkpoint.x, this.checkpoint.y);
      });
    }
  }

  private fallIntoPit(): void {
    if (this.player.takeDamage(this.player.x, this.time.now)) {
      if (this.player.getHealth() <= 0) return;
      this.cameras.main.fadeOut(110, 23, 53, 51);
      this.time.delayedCall(160, () => {
        if (!this.ended && this.player.getHealth() > 0) {
          this.player.restoreAt(this.checkpoint.x, this.checkpoint.y);
          this.cameras.main.fadeIn(180, 247, 244, 232);
        }
      });
    }
  }

  private tryExit(): void {
    const progress = {
      ghostsRemaining: this.ghostsRemaining,
      miniBossDefeated: this.miniBossDefeated,
    };
    const state = getRunState(this.player.getHealth(), canOpenExit(progress));
    if (state === 'won') {
      this.endRun(true);
    } else if (!this.ended && this.time.now >= this.gateHintReadyAt) {
      this.gateHintReadyAt = this.time.now + 1500;
      if (this.ghostsRemaining > 0) {
        this.hud.flashMessage(`${this.ghostsRemaining} CITY SPIRIT${this.ghostsRemaining === 1 ? '' : 'S'} REMAIN`);
      } else {
        this.hud.flashMessage('DEFEAT THE FORMOSAN BLACK BEAR TO OPEN THE GATE');
      }
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

