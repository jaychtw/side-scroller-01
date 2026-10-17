import Phaser from 'phaser';
import { COLORS, PLAYER } from '../config';

const CONTROL_HINT = 'MOVE  A/D or arrows    JUMP  W/Space/↑    STRIKE  J/X    RESTART  R';

export class Hud {
  private readonly hearts: Phaser.GameObjects.Text;
  private readonly objective: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const panel = scene.add
      .rectangle(24, 22, 1232, 76, COLORS.ink, 0.9)
      .setOrigin(0)
      .setStrokeStyle(2, COLORS.sunGold, 0.72)
      .setScrollFactor(0)
      .setDepth(100);

    scene.add
      .text(48, 34, 'FORMOSA QUEST', {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffc117',
        letterSpacing: 2,
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.hearts = scene.add
      .text(48, 67, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '19px',
        color: '#8bc642',
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.objective = scene.add
      .text(370, 40, '', {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '18px',
        color: '#f7f4e8',
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.hint = scene.add
      .text(370, 69, CONTROL_HINT, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#bdebe5',
      })
      .setScrollFactor(0)
      .setDepth(101);

    panel.setData('hud', true);
    this.setHealth(PLAYER.maxHealth);
  }

  setHealth(health: number): void {
    const full = '◆ '.repeat(health);
    const empty = '◇ '.repeat(PLAYER.maxHealth - health);
    this.hearts.setText(`${full}${empty}`.trim());
  }

  setGhostsRemaining(count: number): void {
    this.objective
      .setText(`Clear the city  •  ${count} spirit${count === 1 ? '' : 's'} remaining`)
      .setColor('#f7f4e8');
  }

  setBossHealth(health: number, maxHealth: number): void {
    const marks = '◆ '.repeat(Math.max(0, health)) + '◇ '.repeat(Math.max(0, maxHealth - health));
    this.objective.setText(`MINI-BOSS  •  FORMOSAN BLACK BEAR  ${marks.trim()}`).setColor('#ffc117');
  }

  setExitOpen(): void {
    this.objective.setText('The city is safe  •  Reach the green transit gate →').setColor('#8bc642');
  }

  flashMessage(message: string): void {
    this.hint.setText(message).setColor('#ffc117');
    this.hint.scene.time.delayedCall(1400, () => {
      if (this.hint.active) this.hint.setText(CONTROL_HINT).setColor('#bdebe5');
    });
  }

  showEndState(scene: Phaser.Scene, won: boolean, elapsedSeconds: number): void {
    if (this.overlay) return;

    const shade = scene.add.rectangle(640, 360, 1280, 720, COLORS.deepTeal, 0.76);
    const card = scene.add
      .rectangle(640, 360, 540, 270, COLORS.ink, 0.98)
      .setStrokeStyle(3, won ? COLORS.leafLight : COLORS.sunGold, 0.95);
    const kicker = scene.add
      .text(640, 276, won ? 'CITY ROUTE CLEARED' : 'THE QUEST CONTINUES', {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: won ? '#8bc642' : '#ffc117',
        letterSpacing: 3,
      })
      .setOrigin(0.5);
    const title = scene.add
      .text(640, 329, won ? 'FORMOSA RESTORED' : 'TRY AGAIN', {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#f7f4e8',
      })
      .setOrigin(0.5);
    const detail = scene.add
      .text(
        640,
        384,
        won ? `Quest completed in ${elapsedSeconds.toFixed(1)} seconds` : 'The city spirits are waiting for another run.',
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#bdebe5',
        },
      )
      .setOrigin(0.5);
    const prompt = scene.add
      .text(640, 442, 'PRESS R TO RESTART', {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffc117',
      })
      .setOrigin(0.5);

    this.overlay = scene.add
      .container(0, 0, [shade, card, kicker, title, detail, prompt])
      .setScrollFactor(0)
      .setDepth(200)
      .setAlpha(0);
    scene.tweens.add({ targets: this.overlay, alpha: 1, duration: 240 });
    scene.tweens.add({ targets: prompt, alpha: 0.4, yoyo: true, repeat: -1, duration: 650 });
  }
}

