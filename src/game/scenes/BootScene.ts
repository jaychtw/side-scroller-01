import Phaser from 'phaser';
import { COLORS } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.image('player', 'assets/characters/explorer.png');
    this.load.image('ghost', 'assets/characters/ghost.png');
    this.load.image('bear', 'assets/characters/black-bear.png');
  }

  create(): void {
    this.createWorldTextures();
    this.scene.start('game');
  }

  private createWorldTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(COLORS.concrete).fillRect(0, 0, 64, 64);
    graphics.fillStyle(COLORS.leaf).fillRect(0, 0, 64, 7);
    graphics.fillStyle(0xb7c9be).fillRect(8, 22, 22, 3).fillRect(39, 45, 18, 3);
    graphics.fillStyle(COLORS.cream, 0.55).fillRect(18, 34, 11, 2);
    graphics.generateTexture('ground', 64, 64);
    graphics.clear();

    graphics.fillStyle(COLORS.sunGold, 0.23).fillEllipse(46, 32, 84, 56);
    graphics.lineStyle(7, COLORS.leafLight, 0.92).strokeEllipse(46, 32, 55, 58);
    graphics.lineStyle(3, COLORS.teal, 1).strokeEllipse(46, 32, 38, 52);
    graphics.fillStyle(COLORS.cream).fillCircle(46, 32, 5);
    graphics.generateTexture('gate-open', 92, 64);
    graphics.clear();

    graphics.lineStyle(7, COLORS.asphalt, 0.9).strokeEllipse(46, 32, 55, 58);
    graphics.lineStyle(3, COLORS.deepTeal, 1).strokeEllipse(46, 32, 38, 52);
    graphics.fillStyle(COLORS.ink, 0.84).fillEllipse(46, 32, 30, 48);
    graphics.generateTexture('gate-closed', 92, 64);
    graphics.clear();

    graphics.fillStyle(COLORS.sunGold).fillTriangle(0, 30, 11, 1, 22, 30);
    graphics.fillTriangle(22, 30, 33, 1, 44, 30);
    graphics.fillStyle(COLORS.cream).fillRect(5, 19, 12, 5).fillRect(27, 19, 12, 5);
    graphics.fillStyle(COLORS.ink, 0.28).fillEllipse(22, 30, 48, 7);
    graphics.generateTexture('spikes', 44, 30);
    graphics.clear();

    graphics.fillStyle(COLORS.sunGold, 0.2).fillEllipse(43, 25, 82, 44);
    graphics.lineStyle(5, COLORS.cream, 0.98).beginPath().arc(20, 27, 24, -0.8, 0.8).strokePath();
    graphics.lineStyle(3, COLORS.sunGold, 1).beginPath().arc(25, 27, 31, -0.7, 0.7).strokePath();
    graphics.generateTexture('slash', 86, 54);
    graphics.destroy();
  }
}

