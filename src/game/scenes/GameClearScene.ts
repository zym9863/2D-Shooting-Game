import { Container, Graphics, Text, BlurFilter } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { TitleScene } from './TitleScene';

export class GameClearScene implements Scene {
  container = new Container();
  private game!: Game;
  private score: number;
  private animationFrame: number = 0;
  private particles: Graphics[] = [];
  private titleText!: Text;
  
  private handleKey = (e: KeyboardEvent) => {
    if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      window.removeEventListener('keydown', this.handleKey);
      this.game.switchScene(new TitleScene());
    }
  };

  constructor(score: number) {
    this.score = score;
  }

  init(_app: Application, game: Game): void {
    this.game = game;
    const { COLORS, FONT } = CONFIG;

    // Bright victory background
    const bg = new Graphics();
    this.drawBackground(bg);
    this.container.addChild(bg);
    
    // Celebration particles
    this.createParticles();

    // Victory title with golden glow
    this.titleText = new Text({
      text: 'MISSION CLEAR',
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 36,
        fontWeight: '900',
        fill: COLORS.NEON_YELLOW,
        letterSpacing: 4,
        dropShadow: {
          color: COLORS.NEON_YELLOW,
          alpha: 0.9,
          blur: 25,
          distance: 0,
        },
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.x = CONFIG.GAME_WIDTH / 2;
    this.titleText.y = CONFIG.GAME_HEIGHT / 3;
    this.container.addChild(this.titleText);
    
    // Glow layer
    const glowLayer = new Text({
      text: 'MISSION CLEAR',
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 36,
        fontWeight: '900',
        fill: COLORS.NEON_YELLOW,
        letterSpacing: 4,
      },
    });
    glowLayer.anchor.set(0.5);
    glowLayer.x = CONFIG.GAME_WIDTH / 2;
    glowLayer.y = CONFIG.GAME_HEIGHT / 3;
    glowLayer.alpha = 0.4;
    glowLayer.filters = [new BlurFilter({ strength: 10, quality: 2 })];
    this.container.addChildAt(glowLayer, 1);
    
    // Japanese subtitle
    const jpText = new Text({
      text: '作戦完了',
      style: {
        fontFamily: FONT.UI,
        fontSize: 16,
        fontWeight: '300',
        fill: COLORS.NEON_CYAN,
        letterSpacing: 8,
      },
    });
    jpText.anchor.set(0.5);
    jpText.x = CONFIG.GAME_WIDTH / 2;
    jpText.y = CONFIG.GAME_HEIGHT / 3 + 40;
    this.container.addChild(jpText);

    // Score display with decorative frame
    const scoreFrame = new Graphics();
    scoreFrame.roundRect(
      CONFIG.GAME_WIDTH / 2 - 110,
      CONFIG.GAME_HEIGHT / 2 - 30,
      220,
      60,
      4
    );
    scoreFrame.stroke({ color: COLORS.NEON_CYAN, width: 2, alpha: 0.8 });
    scoreFrame.fill({ color: COLORS.BG_VOID, alpha: 0.9 });
    this.container.addChild(scoreFrame);
    
    // Corner decorations
    const drawCorner = (x: number, y: number, rotation: number) => {
      const corner = new Graphics();
      corner.moveTo(0, 0);
      corner.lineTo(20, 0);
      corner.moveTo(0, 0);
      corner.lineTo(0, 20);
      corner.stroke({ color: COLORS.NEON_CYAN, width: 2 });
      corner.x = x;
      corner.y = y;
      corner.rotation = rotation;
      this.container.addChild(corner);
    };
    
    drawCorner(CONFIG.GAME_WIDTH / 2 - 115, CONFIG.GAME_HEIGHT / 2 - 35, 0);
    drawCorner(CONFIG.GAME_WIDTH / 2 + 115, CONFIG.GAME_HEIGHT / 2 - 35, Math.PI / 2);
    drawCorner(CONFIG.GAME_WIDTH / 2 + 115, CONFIG.GAME_HEIGHT / 2 + 35, Math.PI);
    drawCorner(CONFIG.GAME_WIDTH / 2 - 115, CONFIG.GAME_HEIGHT / 2 + 35, -Math.PI / 2);

    const scoreLabel = new Text({
      text: 'FINAL SCORE',
      style: {
        fontFamily: FONT.UI,
        fontSize: 11,
        fontWeight: '500',
        fill: COLORS.TEXT_DIM,
        letterSpacing: 3,
      },
    });
    scoreLabel.anchor.set(0.5, 1);
    scoreLabel.x = CONFIG.GAME_WIDTH / 2;
    scoreLabel.y = CONFIG.GAME_HEIGHT / 2 - 8;
    this.container.addChild(scoreLabel);

    const scoreText = new Text({
      text: this.score.toLocaleString(),
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 28,
        fontWeight: '700',
        fill: COLORS.TEXT_BRIGHT,
        letterSpacing: 2,
      },
    });
    scoreText.anchor.set(0.5, 0);
    scoreText.x = CONFIG.GAME_WIDTH / 2;
    scoreText.y = CONFIG.GAME_HEIGHT / 2 - 2;
    this.container.addChild(scoreText);

    // Continue prompt
    const hint = new Text({
      text: '[ PRESS Z TO CONTINUE ]',
      style: {
        fontFamily: FONT.UI,
        fontSize: 14,
        fontWeight: '500',
        fill: COLORS.TEXT_DIM,
        letterSpacing: 3,
      },
    });
    hint.anchor.set(0.5);
    hint.x = CONFIG.GAME_WIDTH / 2;
    hint.y = CONFIG.GAME_HEIGHT * 0.72;
    this.container.addChild(hint);
    
    // Blinking effect
    let visible = true;
    setInterval(() => {
      visible = !visible;
      hint.alpha = visible ? 1 : 0.3;
    }, 500);

    // Victory message
    const message = new Text({
      text: '━━ ALL HOSTILES ELIMINATED ━━',
      style: {
        fontFamily: FONT.UI,
        fontSize: 10,
        fontWeight: '300',
        fill: COLORS.TEXT_MUTED,
        letterSpacing: 3,
      },
    });
    message.anchor.set(0.5);
    message.x = CONFIG.GAME_WIDTH / 2;
    message.y = CONFIG.GAME_HEIGHT - 30;
    this.container.addChild(message);

    window.addEventListener('keydown', this.handleKey);
    this.animate();
  }
  
  private drawBackground(bg: Graphics): void {
    const { COLORS } = CONFIG;
    
    // Dark base
    bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    bg.fill({ color: COLORS.BG_VOID, alpha: 0.95 });
    
    // Radial glow from center
    const cx = CONFIG.GAME_WIDTH / 2;
    const cy = CONFIG.GAME_HEIGHT / 2;
    
    for (let i = 15; i > 0; i--) {
      bg.circle(cx, cy, 50 + i * 30);
      bg.fill({ 
        color: COLORS.NEON_CYAN, 
        alpha: 0.008 * (16 - i),
      });
    }
    
    // Golden accent glow
    for (let i = 10; i > 0; i--) {
      bg.circle(cx, cy - 100, 30 + i * 15);
      bg.fill({ 
        color: COLORS.NEON_YELLOW, 
        alpha: 0.01 * (11 - i),
      });
    }
  }
  
  private createParticles(): void {
    const { COLORS } = CONFIG;
    const colors = [COLORS.NEON_CYAN, COLORS.NEON_YELLOW, COLORS.NEON_GREEN, COLORS.NEON_PURPLE];
    
    for (let i = 0; i < 30; i++) {
      const particle = new Graphics();
      const size = Math.random() * 3 + 1;
      
      // Mix of circles and diamonds
      if (Math.random() > 0.5) {
        particle.circle(0, 0, size);
      } else {
        particle.poly([0, -size, size, 0, 0, size, -size, 0]);
      }
      
      particle.fill({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.4 + Math.random() * 0.4,
      });
      
      particle.x = Math.random() * CONFIG.GAME_WIDTH;
      particle.y = CONFIG.GAME_HEIGHT + Math.random() * 100;
      (particle as any).speedY = -(0.5 + Math.random() * 1.5);
      (particle as any).speedX = (Math.random() - 0.5) * 0.5;
      (particle as any).rotationSpeed = (Math.random() - 0.5) * 0.05;
      this.particles.push(particle);
      this.container.addChild(particle);
    }
  }
  
  private animate = (): void => {
    this.animationFrame = requestAnimationFrame(this.animate);
    
    // Animate particles rising
    for (const particle of this.particles) {
      particle.y += (particle as any).speedY;
      particle.x += (particle as any).speedX;
      particle.rotation += (particle as any).rotationSpeed;
      
      if (particle.y < -10) {
        particle.y = CONFIG.GAME_HEIGHT + 10;
        particle.x = Math.random() * CONFIG.GAME_WIDTH;
      }
    }
    
    // Pulsing title effect
    const scale = 1 + Math.sin(Date.now() * 0.003) * 0.02;
    this.titleText.scale.set(scale);
  };

  destroy(): void {
    window.removeEventListener('keydown', this.handleKey);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.container.destroy({ children: true });
  }
}
