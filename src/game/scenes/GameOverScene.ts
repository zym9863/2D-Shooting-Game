import { Container, Text, Graphics, BlurFilter } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { GameScene } from './GameScene';

export class GameOverScene implements Scene {
  container = new Container();
  private game!: Game;
  private score: number;
  private animationFrame: number = 0;
  private particles: Graphics[] = [];
  private titleText!: Text;
  
  private handleKey = (e: KeyboardEvent) => {
    if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      window.removeEventListener('keydown', this.handleKey);
      this.game.switchScene(new GameScene());
    }
  };

  constructor(score: number) {
    this.score = score;
  }

  init(_app: Application, game: Game): void {
    this.game = game;
    const { COLORS, FONT } = CONFIG;

    // Dark overlay with scanlines effect
    const bg = new Graphics();
    this.drawBackground(bg);
    this.container.addChild(bg);
    
    // Create falling debris particles
    this.createParticles();

    // Glitch-style GAME OVER title
    this.titleText = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 40,
        fontWeight: '900',
        fill: COLORS.NEON_PINK,
        letterSpacing: 6,
        dropShadow: {
          color: COLORS.NEON_PINK,
          alpha: 0.9,
          blur: 20,
          distance: 0,
        },
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.x = CONFIG.GAME_WIDTH / 2;
    this.titleText.y = CONFIG.GAME_HEIGHT / 3;
    this.container.addChild(this.titleText);
    
    // Glitch layer (offset red)
    const glitchRed = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 40,
        fontWeight: '900',
        fill: 0xff0044,
        letterSpacing: 6,
      },
    });
    glitchRed.anchor.set(0.5);
    glitchRed.x = CONFIG.GAME_WIDTH / 2 + 3;
    glitchRed.y = CONFIG.GAME_HEIGHT / 3;
    glitchRed.alpha = 0.5;
    glitchRed.blendMode = 'add';
    this.container.addChild(glitchRed);
    
    // Glitch layer (offset cyan)
    const glitchCyan = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 40,
        fontWeight: '900',
        fill: COLORS.NEON_CYAN,
        letterSpacing: 6,
      },
    });
    glitchCyan.anchor.set(0.5);
    glitchCyan.x = CONFIG.GAME_WIDTH / 2 - 3;
    glitchCyan.y = CONFIG.GAME_HEIGHT / 3;
    glitchCyan.alpha = 0.3;
    glitchCyan.blendMode = 'add';
    this.container.addChild(glitchCyan);

    // Score display with frame
    const scoreFrame = new Graphics();
    scoreFrame.roundRect(
      CONFIG.GAME_WIDTH / 2 - 100,
      CONFIG.GAME_HEIGHT / 2 - 25,
      200,
      50,
      4
    );
    scoreFrame.stroke({ color: COLORS.NEON_PURPLE, width: 2, alpha: 0.6 });
    scoreFrame.fill({ color: COLORS.BG_VOID, alpha: 0.8 });
    this.container.addChild(scoreFrame);

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
        fontSize: 24,
        fontWeight: '700',
        fill: COLORS.TEXT_BRIGHT,
        letterSpacing: 2,
      },
    });
    scoreText.anchor.set(0.5, 0);
    scoreText.x = CONFIG.GAME_WIDTH / 2;
    scoreText.y = CONFIG.GAME_HEIGHT / 2 - 2;
    this.container.addChild(scoreText);

    // Retry prompt
    const retry = new Text({
      text: '[ PRESS Z TO RETRY ]',
      style: {
        fontFamily: FONT.UI,
        fontSize: 14,
        fontWeight: '500',
        fill: COLORS.TEXT_DIM,
        letterSpacing: 3,
      },
    });
    retry.anchor.set(0.5);
    retry.x = CONFIG.GAME_WIDTH / 2;
    retry.y = CONFIG.GAME_HEIGHT * 0.68;
    this.container.addChild(retry);
    
    // Blinking effect for retry
    let visible = true;
    setInterval(() => {
      visible = !visible;
      retry.alpha = visible ? 1 : 0.3;
    }, 500);

    // Failure message
    const message = new Text({
      text: '━━ SYSTEM FAILURE ━━',
      style: {
        fontFamily: FONT.UI,
        fontSize: 10,
        fontWeight: '300',
        fill: COLORS.TEXT_MUTED,
        letterSpacing: 4,
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
    
    // Scanlines
    bg.setStrokeStyle({ width: 1, color: 0x000000, alpha: 0.3 });
    for (let y = 0; y < CONFIG.GAME_HEIGHT; y += 4) {
      bg.moveTo(0, y);
      bg.lineTo(CONFIG.GAME_WIDTH, y);
    }
    bg.stroke();
    
    // Red vignette
    const drawVignette = () => {
      const cx = CONFIG.GAME_WIDTH / 2;
      const cy = CONFIG.GAME_HEIGHT / 2;
      for (let i = 10; i > 0; i--) {
        bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        bg.fill({ 
          color: COLORS.NEON_PINK, 
          alpha: 0.01 * (11 - i),
        });
      }
    };
    drawVignette();
  }
  
  private createParticles(): void {
    const { COLORS } = CONFIG;
    
    for (let i = 0; i < 20; i++) {
      const particle = new Graphics();
      const size = Math.random() * 2 + 0.5;
      particle.rect(-size, -size, size * 2, size * 2);
      particle.fill({ 
        color: [COLORS.NEON_PINK, COLORS.NEON_ORANGE, COLORS.TEXT_DIM][Math.floor(Math.random() * 3)],
        alpha: 0.3 + Math.random() * 0.5,
      });
      particle.x = Math.random() * CONFIG.GAME_WIDTH;
      particle.y = Math.random() * CONFIG.GAME_HEIGHT;
      (particle as any).speedY = 1 + Math.random() * 2;
      (particle as any).speedX = (Math.random() - 0.5) * 0.5;
      (particle as any).rotation = Math.random() * Math.PI * 2;
      (particle as any).rotationSpeed = (Math.random() - 0.5) * 0.1;
      this.particles.push(particle);
      this.container.addChild(particle);
    }
  }
  
  private animate = (): void => {
    this.animationFrame = requestAnimationFrame(this.animate);
    
    // Animate particles
    for (const particle of this.particles) {
      particle.y += (particle as any).speedY;
      particle.x += (particle as any).speedX;
      particle.rotation += (particle as any).rotationSpeed;
      
      if (particle.y > CONFIG.GAME_HEIGHT + 10) {
        particle.y = -10;
        particle.x = Math.random() * CONFIG.GAME_WIDTH;
      }
    }
    
    // Subtle glitch effect on title
    if (Math.random() < 0.02) {
      this.titleText.x = CONFIG.GAME_WIDTH / 2 + (Math.random() - 0.5) * 4;
      setTimeout(() => {
        this.titleText.x = CONFIG.GAME_WIDTH / 2;
      }, 50);
    }
  };

  destroy(): void {
    window.removeEventListener('keydown', this.handleKey);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.container.destroy({ children: true });
  }
}
