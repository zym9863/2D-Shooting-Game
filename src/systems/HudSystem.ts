import { System, World } from '@/ecs';
import { PlayerTag, Weapon, Health } from '@/components';
import { Text, Container, Graphics } from 'pixi.js';
import { CONFIG } from '@/game/config';

export class HudSystem extends System {
  priority = 95;
  private container: Container;
  private scoreText: Text;
  private livesText: Text;
  private bombsText: Text;
  private weaponText: Text;
  private waveText: Text;
  private lives: number = CONFIG.PLAYER_LIVES;

  constructor(stage: Container) {
    super();
    this.container = new Container();
    stage.addChild(this.container);

    const style = {
      fontFamily: 'Courier New, monospace',
      fontSize: 14,
      fill: 0x00ffcc,
    };

    this.scoreText = new Text({ text: 'SCORE: 0', style });
    this.scoreText.x = 8;
    this.scoreText.y = 4;
    this.container.addChild(this.scoreText);

    this.livesText = new Text({ text: `LIVES: ${this.lives}`, style: { ...style, fill: 0xff6666 } });
    this.livesText.x = 160;
    this.livesText.y = 4;
    this.container.addChild(this.livesText);

    this.bombsText = new Text({ text: 'BOMB: 3', style: { ...style, fill: 0xffcc00 } });
    this.bombsText.x = 280;
    this.bombsText.y = 4;
    this.container.addChild(this.bombsText);

    this.weaponText = new Text({ text: 'VULCAN Lv1', style: { ...style, fill: 0x88ccff } });
    this.weaponText.x = 380;
    this.weaponText.y = 4;
    this.container.addChild(this.weaponText);

    this.waveText = new Text({ text: '', style: { ...style, fontSize: 24, fill: 0xffffff } });
    this.waveText.anchor.set(0.5);
    this.waveText.x = CONFIG.GAME_WIDTH / 2;
    this.waveText.y = CONFIG.GAME_HEIGHT / 3;
    this.waveText.alpha = 0;
    this.container.addChild(this.waveText);
  }

  setLives(lives: number): void {
    this.lives = lives;
  }

  showWave(wave: number): void {
    this.waveText.text = `WAVE ${wave}`;
    this.waveText.alpha = 1;
  }

  update(world: World, dt: number): void {
    const player = world.queryFirst(PlayerTag);
    if (player) {
      const tag = player.getComponent<PlayerTag>(PlayerTag)!;
      const weapon = player.getComponent<Weapon>(Weapon);
      this.scoreText.text = `SCORE: ${tag.score}`;
      this.livesText.text = `LIVES: ${this.lives}`;
      this.bombsText.text = `BOMB: ${tag.bombs}`;
      if (weapon) {
        this.weaponText.text = `${weapon.weaponType.toUpperCase()} Lv${weapon.level}`;
      }
    }

    if (this.waveText.alpha > 0) {
      this.waveText.alpha -= 0.01 * dt;
    }
  }
}
