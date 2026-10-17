import Phaser from 'phaser';
import { COLORS } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.createPlayerTexture();
    this.createEnemyTexture();
    this.createWorldTextures();
    this.scene.start('game');
  }

  private createPlayerTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x0d1225).fillRoundedRect(5, 10, 27, 34, 7);
    graphics.fillStyle(COLORS.ember).fillRoundedRect(2, 13, 31, 20, 6);
    graphics.fillStyle(COLORS.white).fillRoundedRect(7, 4, 22, 19, 6);
    graphics.fillStyle(0x272d4a).fillRect(7, 16, 22, 8);
    graphics.fillStyle(COLORS.gold).fillCircle(22, 18, 2);
    graphics.fillStyle(0x1b203c).fillRect(7, 40, 8, 6).fillRect(22, 40, 8, 6);
    graphics.generateTexture('player', 36, 48);
    graphics.destroy();
  }

  private createEnemyTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x231c37).fillRoundedRect(3, 9, 38, 34, 8);
    graphics.fillStyle(0x9c4e6d).fillRoundedRect(6, 14, 32, 26, 7);
    graphics.fillStyle(0x18172c).fillRoundedRect(9, 3, 26, 24, 8);
    graphics.fillStyle(COLORS.ember).fillCircle(15, 16, 3).fillCircle(29, 16, 3);
    graphics.fillStyle(0x18172c).fillTriangle(6, 10, 8, 0, 16, 8);
    graphics.fillTriangle(28, 8, 37, 0, 39, 12);
    graphics.generateTexture('enemy', 44, 48);
    graphics.destroy();
  }

  private createWorldTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(COLORS.stone).fillRect(0, 0, 64, 64);
    graphics.fillStyle(COLORS.stoneTop).fillRect(0, 0, 64, 7);
    graphics.fillStyle(0x3e4866).fillRect(8, 22, 22, 3).fillRect(39, 45, 18, 3);
    graphics.generateTexture('ground', 64, 64);
    graphics.clear();

    graphics.fillStyle(COLORS.gold, 0.2).fillEllipse(46, 32, 84, 56);
    graphics.lineStyle(7, COLORS.gold, 0.75).strokeEllipse(46, 32, 55, 58);
    graphics.lineStyle(3, COLORS.ember, 1).strokeEllipse(46, 32, 38, 52);
    graphics.fillStyle(COLORS.white).fillCircle(46, 32, 5);
    graphics.generateTexture('gate-open', 92, 64);
    graphics.clear();

    graphics.lineStyle(7, 0x53607d, 0.9).strokeEllipse(46, 32, 55, 58);
    graphics.lineStyle(3, 0x343e5d, 1).strokeEllipse(46, 32, 38, 52);
    graphics.fillStyle(0x202640, 0.9).fillEllipse(46, 32, 30, 48);
    graphics.generateTexture('gate-closed', 92, 64);
    graphics.clear();

    graphics.fillStyle(0x972f4f).fillTriangle(0, 30, 12, 0, 24, 30);
    graphics.fillTriangle(20, 30, 32, 0, 44, 30);
    graphics.fillStyle(COLORS.ember).fillTriangle(7, 30, 13, 10, 20, 30);
    graphics.fillTriangle(27, 30, 33, 10, 40, 30);
    graphics.generateTexture('spikes', 44, 30);
    graphics.clear();

    graphics.fillStyle(COLORS.gold, 0.18).fillEllipse(43, 25, 82, 44);
    graphics.lineStyle(5, COLORS.white, 0.95).beginPath().arc(20, 27, 24, -0.8, 0.8).strokePath();
    graphics.lineStyle(3, COLORS.gold, 1).beginPath().arc(25, 27, 31, -0.7, 0.7).strokePath();
    graphics.generateTexture('slash', 86, 54);
    graphics.destroy();
  }
}

