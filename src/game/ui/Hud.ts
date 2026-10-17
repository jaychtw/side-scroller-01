import Phaser from 'phaser';
import { COLORS, PLAYER } from '../config';

export class Hud {
  private readonly hearts: Phaser.GameObjects.Text;
  private readonly objective: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const panel = scene.add
      .rectangle(24, 22, 1232, 76, COLORS.ink, 0.82)
      .setOrigin(0)
      .setStrokeStyle(1, COLORS.gold, 0.22)
      .setScrollFactor(0)
      .setDepth(100);

    scene.add
      .text(48, 34, 'EMBERFALL', {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '25px',
        fontStyle: 'bold',
        color: '#ffd36a',
        letterSpacing: 2,
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.hearts = scene.add
      .text(48, 67, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '19px',
        color: '#ff6b57',
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.objective = scene.add
      .text(370, 40, '', {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '18px',
        color: '#fff8e8',
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.hint = scene.add
      .text(370, 69, 'MOVE  A/D or arrows    JUMP  W/Space/↑    STRIKE  J/X    RESTART  R', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        color: '#aab4ce',
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

  setEnemiesRemaining(count: number): void {
    this.objective.setText(
      count > 0
        ? `Clear the road  •  ${count} sentinel${count === 1 ? '' : 's'} remaining`
        : 'The seal is broken  •  Reach the ember gate →',
    );
    this.objective.setColor(count > 0 ? '#fff8e8' : '#68e0c1');
  }

  flashMessage(message: string): void {
    this.hint.setText(message).setColor('#ffd36a');
    this.hint.scene.time.delayedCall(1300, () => {
      if (this.hint.active) {
        this.hint
          .setText('MOVE  A/D or arrows    JUMP  W/Space/↑    STRIKE  J/X    RESTART  R')
          .setColor('#aab4ce');
      }
    });
  }

  showEndState(scene: Phaser.Scene, won: boolean, elapsedSeconds: number): void {
    if (this.overlay) return;

    const shade = scene.add.rectangle(640, 360, 1280, 720, 0x080a16, 0.78);
    const card = scene.add
      .rectangle(640, 360, 520, 270, COLORS.ink, 0.98)
      .setStrokeStyle(2, won ? COLORS.mint : COLORS.ember, 0.85);
    const kicker = scene.add
      .text(640, 276, won ? 'ROAD CLEARED' : 'THE FLAME FADES', {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: won ? '#68e0c1' : '#ff795a',
        letterSpacing: 3,
      })
      .setOrigin(0.5);
    const title = scene.add
      .text(640, 329, won ? 'EMBER RESTORED' : 'RISE AGAIN', {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#fff8e8',
      })
      .setOrigin(0.5);
    const detail = scene.add
      .text(
        640,
        384,
        won ? `Run completed in ${elapsedSeconds.toFixed(1)} seconds` : 'The sentinels still guard the pass.',
        {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          color: '#aab4ce',
        },
      )
      .setOrigin(0.5);
    const prompt = scene.add
      .text(640, 442, 'PRESS R TO RESTART', {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffd36a',
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

