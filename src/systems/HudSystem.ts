import { System, World } from '@/ecs';
import { PlayerTag, Weapon, Health } from '@/components';
import { Text, Container, Graphics, BlurFilter } from 'pixi.js';
import { CONFIG } from '@/game/config';

export class HudSystem extends System {
  priority = 95;
  private container: Container;
  private scoreText: Text;
  private scoreLabel: Text;
  private livesContainer: Container;
  private lives: number = CONFIG.PLAYER_LIVES;
  private bombsContainer: Container;
  private weaponText: Text;
  private weaponFrame: Graphics;
  private waveText: Text;
  private waveAlpha: number = 0;
  private topBar: Graphics;

  constructor(stage: Container) {
    super();
    this.container = new Container();
    stage.addChild(this.container);
    
    const { COLORS, FONT } = CONFIG;

    // Top bar background
    this.topBar = new Graphics();
    this.topBar.rect(0, 0, CONFIG.GAME_WIDTH, 32);
    this.topBar.fill({ color: COLORS.BG_VOID, alpha: 0.85 });
    this.topBar.rect(0, 31, CONFIG.GAME_WIDTH, 1);
    this.topBar.stroke({ color: COLORS.NEON_CYAN, alpha: 0.3, width: 1 });
    this.container.addChild(this.topBar);

    // Score section
    this.scoreLabel = new Text({ 
      text: 'SCORE', 
      style: {
        fontFamily: FONT.UI,
        fontSize: 9,
        fontWeight: '500',
        fill: COLORS.TEXT_MUTED,
        letterSpacing: 2,
      }
    });
    this.scoreLabel.x = 12;
    this.scoreLabel.y = 6;
    this.container.addChild(this.scoreLabel);

    this.scoreText = new Text({ 
      text: '0', 
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 16,
        fontWeight: '700',
        fill: COLORS.NEON_CYAN,
        letterSpacing: 1,
      }
    });
    this.scoreText.x = 12;
    this.scoreText.y = 16;
    this.container.addChild(this.scoreText);

    // Lives display (visual hearts)
    this.livesContainer = new Container();
    this.livesContainer.x = 150;
    this.livesContainer.y = 10;
    this.container.addChild(this.livesContainer);
    this.updateLivesDisplay();

    // Bombs display (visual icons)
    this.bombsContainer = new Container();
    this.bombsContainer.x = 260;
    this.bombsContainer.y = 10;
    this.container.addChild(this.bombsContainer);
    this.updateBombsDisplay(3);

    // Weapon display with frame
    this.weaponFrame = new Graphics();
    this.weaponFrame.roundRect(CONFIG.GAME_WIDTH - 120, 4, 108, 24, 3);
    this.weaponFrame.stroke({ color: COLORS.NEON_PURPLE, alpha: 0.5, width: 1 });
    this.weaponFrame.fill({ color: COLORS.BG_VOID, alpha: 0.6 });
    this.container.addChild(this.weaponFrame);

    this.weaponText = new Text({ 
      text: 'VULCAN Lv1', 
      style: {
        fontFamily: FONT.UI,
        fontSize: 12,
        fontWeight: '600',
        fill: COLORS.NEON_PURPLE,
        letterSpacing: 1,
      }
    });
    this.weaponText.x = CONFIG.GAME_WIDTH - 114;
    this.weaponText.y = 10;
    this.container.addChild(this.weaponText);

    // Wave announcement text (center, large)
    this.waveText = new Text({ 
      text: '', 
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 28,
        fontWeight: '900',
        fill: COLORS.TEXT_BRIGHT,
        letterSpacing: 6,
        dropShadow: {
          color: COLORS.NEON_CYAN,
          alpha: 0.8,
          blur: 10,
          distance: 0,
        },
      }
    });
    this.waveText.anchor.set(0.5);
    this.waveText.x = CONFIG.GAME_WIDTH / 2;
    this.waveText.y = CONFIG.GAME_HEIGHT / 3;
    this.waveText.alpha = 0;
    this.container.addChild(this.waveText);
  }

  private updateLivesDisplay(): void {
    this.livesContainer.removeChildren();
    const { COLORS, FONT } = CONFIG;
    
    const label = new Text({
      text: 'LIFE',
      style: {
        fontFamily: FONT.UI,
        fontSize: 9,
        fontWeight: '500',
        fill: COLORS.TEXT_MUTED,
        letterSpacing: 1,
      }
    });
    label.y = -4;
    this.livesContainer.addChild(label);
    
    for (let i = 0; i < this.lives; i++) {
      const heart = new Graphics();
      // Triangle ship shape representing life
      heart.poly([0, -6, -5, 5, 5, 5]);
      heart.fill({ color: COLORS.NEON_PINK, alpha: 0.8 });
      heart.stroke({ color: COLORS.NEON_PINK, width: 1 });
      heart.x = 30 + i * 16;
      heart.y = 6;
      this.livesContainer.addChild(heart);
    }
  }

  private updateBombsDisplay(count: number): void {
    this.bombsContainer.removeChildren();
    const { COLORS, FONT } = CONFIG;
    
    const label = new Text({
      text: 'BOMB',
      style: {
        fontFamily: FONT.UI,
        fontSize: 9,
        fontWeight: '500',
        fill: COLORS.TEXT_MUTED,
        letterSpacing: 1,
      }
    });
    label.y = -4;
    this.bombsContainer.addChild(label);
    
    for (let i = 0; i < count; i++) {
      const bomb = new Graphics();
      // Diamond shape for bomb
      bomb.poly([0, -5, 5, 0, 0, 5, -5, 0]);
      bomb.fill({ color: COLORS.NEON_YELLOW, alpha: 0.8 });
      bomb.stroke({ color: COLORS.NEON_YELLOW, width: 1 });
      bomb.x = 35 + i * 14;
      bomb.y = 6;
      this.bombsContainer.addChild(bomb);
    }
  }

  setLives(lives: number): void {
    this.lives = lives;
    this.updateLivesDisplay();
  }

  showWave(wave: number): void {
    this.waveText.text = `WAVE ${wave}`;
    this.waveAlpha = 1;
    
    // Add glow effect
    this.waveText.style.dropShadow = {
      color: CONFIG.COLORS.NEON_CYAN,
      alpha: 0.9,
      blur: 15,
      distance: 0,
      angle: 0,
    };
  }

  update(world: World, dt: number): void {
    const player = world.queryFirst(PlayerTag);
    if (player) {
      const tag = player.getComponent<PlayerTag>(PlayerTag)!;
      const weapon = player.getComponent<Weapon>(Weapon);
      
      // Update score with animation potential
      this.scoreText.text = tag.score.toLocaleString();
      
      // Update bombs
      this.updateBombsDisplay(tag.bombs);
      
      // Update weapon display
      if (weapon) {
        const weaponName = weapon.weaponType.toUpperCase();
        this.weaponText.text = `${weaponName} Lv${weapon.level}`;
        
        // Color based on weapon type
        const weaponColors: Record<string, number> = {
          'vulcan': CONFIG.COLORS.NEON_CYAN,
          'spread': CONFIG.COLORS.NEON_ORANGE,
          'laser': CONFIG.COLORS.NEON_PURPLE,
        };
        this.weaponText.style.fill = weaponColors[weapon.weaponType] || CONFIG.COLORS.NEON_PURPLE;
      }
    }

    // Fade out wave text
    if (this.waveAlpha > 0) {
      this.waveAlpha -= 0.008 * dt;
      if (this.waveAlpha < 0) this.waveAlpha = 0;
      this.waveText.alpha = this.waveAlpha;
    }
  }
}
