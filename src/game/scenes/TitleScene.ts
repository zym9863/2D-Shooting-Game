import { Container, Text, Graphics, BlurFilter } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Game, Scene } from '../Game';
import { CONFIG } from '../config';
import { GameScene } from './GameScene';

export class TitleScene implements Scene {
  container = new Container();
  private game!: Game;
  private blinkInterval: ReturnType<typeof setInterval> | null = null;
  private animationFrame: number = 0;
  private particles: Graphics[] = [];
  private titleText!: Text;
  private subtitleText!: Text;
  
  private handleKey = (e: KeyboardEvent) => {
    if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      window.removeEventListener('keydown', this.handleKey);
      this.game.switchScene(new GameScene());
    }
  };

  init(_app: Application, game: Game): void {
    this.game = game;
    const { COLORS, FONT } = CONFIG;

    // Animated background with gradient mesh effect
    const bg = new Graphics();
    this.drawBackground(bg);
    this.container.addChild(bg);
    
    // Floating particles
    this.createParticles();

    // Main title with glow effect
    this.titleText = new Text({
      text: 'NEON BARRAGE',
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 42,
        fontWeight: '900',
        fill: COLORS.NEON_CYAN,
        letterSpacing: 8,
        dropShadow: {
          color: COLORS.NEON_CYAN,
          alpha: 0.8,
          blur: 15,
          distance: 0,
        },
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.x = CONFIG.GAME_WIDTH / 2;
    this.titleText.y = CONFIG.GAME_HEIGHT / 3;
    this.container.addChild(this.titleText);
    
    // Title glow layer
    const titleGlow = new Text({
      text: 'NEON BARRAGE',
      style: {
        fontFamily: FONT.DISPLAY,
        fontSize: 42,
        fontWeight: '900',
        fill: COLORS.NEON_CYAN,
        letterSpacing: 8,
      },
    });
    titleGlow.anchor.set(0.5);
    titleGlow.x = CONFIG.GAME_WIDTH / 2;
    titleGlow.y = CONFIG.GAME_HEIGHT / 3;
    titleGlow.alpha = 0.3;
    titleGlow.filters = [new BlurFilter({ strength: 8, quality: 2 })];
    this.container.addChildAt(titleGlow, 1);

    // Subtitle with Japanese text
    const jpText = new Text({
      text: '霓虹弾幕',
      style: {
        fontFamily: FONT.UI,
        fontSize: 18,
        fontWeight: '300',
        fill: COLORS.NEON_PINK,
        letterSpacing: 12,
      },
    });
    jpText.anchor.set(0.5);
    jpText.x = CONFIG.GAME_WIDTH / 2;
    jpText.y = CONFIG.GAME_HEIGHT / 3 + 45;
    this.container.addChild(jpText);

    // Blinking start prompt
    this.subtitleText = new Text({
      text: '[ PRESS Z TO START ]',
      style: {
        fontFamily: FONT.UI,
        fontSize: 16,
        fontWeight: '500',
        fill: COLORS.TEXT_BRIGHT,
        letterSpacing: 4,
      },
    });
    this.subtitleText.anchor.set(0.5);
    this.subtitleText.x = CONFIG.GAME_WIDTH / 2;
    this.subtitleText.y = CONFIG.GAME_HEIGHT / 2 + 20;
    this.container.addChild(this.subtitleText);

    // Control instructions with icons
    const controls = new Text({
      text: '━━━ CONTROLS ━━━\n\nMOVE     : ARROWS / WASD\nFIRE     : Z\nBOMB     : X\nSLOW     : SHIFT\nWEAPON : 1 / 2 / 3',
      style: {
        fontFamily: FONT.UI,
        fontSize: 13,
        fontWeight: '400',
        fill: COLORS.TEXT_DIM,
        align: 'center',
        lineHeight: 22,
        letterSpacing: 2,
      },
    });
    controls.anchor.set(0.5);
    controls.x = CONFIG.GAME_WIDTH / 2;
    controls.y = CONFIG.GAME_HEIGHT * 0.72;
    this.container.addChild(controls);
    
    // Version info
    const version = new Text({
      text: 'v1.0.0 // ECS ARCHITECTURE',
      style: {
        fontFamily: FONT.UI,
        fontSize: 10,
        fontWeight: '300',
        fill: COLORS.TEXT_MUTED,
        letterSpacing: 2,
      },
    });
    version.anchor.set(0.5);
    version.x = CONFIG.GAME_WIDTH / 2;
    version.y = CONFIG.GAME_HEIGHT - 20;
    this.container.addChild(version);

    // Blink animation
    let visible = true;
    this.blinkInterval = setInterval(() => {
      visible = !visible;
      this.subtitleText.alpha = visible ? 1 : 0.2;
    }, CONFIG.ANIMATION.TEXT_BLINK);

    window.addEventListener('keydown', this.handleKey);
    
    // Start animation loop
    this.animate();
  }
  
  private drawBackground(bg: Graphics): void {
    const { COLORS } = CONFIG;
    
    // Base gradient simulation with layered rects
    bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    bg.fill({ color: COLORS.BG_VOID });
    
    // Add subtle grid pattern
    bg.setStrokeStyle({ width: 1, color: COLORS.BG_SURFACE, alpha: 0.3 });
    const gridSize = 40;
    for (let x = 0; x <= CONFIG.GAME_WIDTH; x += gridSize) {
      bg.moveTo(x, 0);
      bg.lineTo(x, CONFIG.GAME_HEIGHT);
    }
    for (let y = 0; y <= CONFIG.GAME_HEIGHT; y += gridSize) {
      bg.moveTo(0, y);
      bg.lineTo(CONFIG.GAME_WIDTH, y);
    }
    bg.stroke();
    
    // Radial glow spots
    const drawGlowSpot = (x: number, y: number, radius: number, color: number) => {
      for (let i = 5; i > 0; i--) {
        bg.circle(x, y, radius * (i / 5));
        bg.fill({ color, alpha: 0.02 * (6 - i) });
      }
    };
    
    drawGlowSpot(CONFIG.GAME_WIDTH * 0.2, CONFIG.GAME_HEIGHT * 0.8, 150, COLORS.NEON_PURPLE);
    drawGlowSpot(CONFIG.GAME_WIDTH * 0.8, CONFIG.GAME_HEIGHT * 0.2, 120, COLORS.NEON_CYAN);
    drawGlowSpot(CONFIG.GAME_WIDTH * 0.5, CONFIG.GAME_HEIGHT * 0.5, 100, COLORS.NEON_PINK);
  }
  
  private createParticles(): void {
    const { COLORS } = CONFIG;
    
    for (let i = 0; i < 15; i++) {
      const particle = new Graphics();
      const size = Math.random() * 3 + 1;
      particle.circle(0, 0, size);
      particle.fill({ 
        color: [COLORS.NEON_CYAN, COLORS.NEON_PINK, COLORS.NEON_PURPLE][Math.floor(Math.random() * 3)],
        alpha: 0.4 + Math.random() * 0.4,
      });
      particle.x = Math.random() * CONFIG.GAME_WIDTH;
      particle.y = Math.random() * CONFIG.GAME_HEIGHT;
      (particle as any).speedY = 0.2 + Math.random() * 0.5;
      (particle as any).speedX = (Math.random() - 0.5) * 0.3;
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
      
      if (particle.y > CONFIG.GAME_HEIGHT + 10) {
        particle.y = -10;
        particle.x = Math.random() * CONFIG.GAME_WIDTH;
      }
      if (particle.x < -10) particle.x = CONFIG.GAME_WIDTH + 10;
      if (particle.x > CONFIG.GAME_WIDTH + 10) particle.x = -10;
    }
    
    // Subtle title pulse
    const scale = 1 + Math.sin(Date.now() * 0.002) * 0.01;
    this.titleText.scale.set(scale);
  };

  destroy(): void {
    window.removeEventListener('keydown', this.handleKey);
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.container.destroy({ children: true });
  }
}
