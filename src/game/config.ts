export const CONFIG = {
  // Game dimensions
  GAME_WIDTH: 480,
  GAME_HEIGHT: 720,
  
  // Core colors - Neon Cyberpunk palette
  COLORS: {
    // Primary neon colors
    NEON_CYAN: 0x00fff2,
    NEON_PINK: 0xff2d95,
    NEON_PURPLE: 0xb829ff,
    NEON_YELLOW: 0xffe600,
    NEON_ORANGE: 0xff6b2d,
    NEON_BLUE: 0x2d7aff,
    NEON_GREEN: 0x2dff7a,
    
    // Background depths
    BG_VOID: 0x050510,
    BG_DEEP: 0x0a0a1a,
    BG_MID: 0x12122a,
    BG_SURFACE: 0x1a1a3a,
    
    // Text colors
    TEXT_BRIGHT: 0xffffff,
    TEXT_DIM: 0x8888aa,
    TEXT_MUTED: 0x555577,
    
    // Faction colors
    PLAYER_PRIMARY: 0x00fff2,
    PLAYER_SECONDARY: 0x2dff7a,
    ENEMY_PRIMARY: 0xff2d95,
    ENEMY_SECONDARY: 0xff6b2d,
    ENEMY_ELITE: 0xb829ff,
    BULLET_PLAYER: 0x00fff2,
    BULLET_ENEMY: 0xff2d95,
    POWERUP_WEAPON: 0xffe600,
    POWERUP_HEALTH: 0x2dff7a,
    POWERUP_BOMB: 0xb829ff,
  },
  
  // Legacy compatibility
  get BACKGROUND_COLOR() { return this.COLORS.BG_DEEP; },
  
  // Player settings
  PLAYER_SPEED: 5,
  PLAYER_SLOW_SPEED: 2,
  PLAYER_HITBOX_RADIUS: 3,
  PLAYER_LIVES: 3,
  PLAYER_BOMBS: 3,
  PLAYER_INVINCIBLE_TIME: 2000,
  
  // Performance settings
  BULLET_POOL_SIZE: 2000,
  PARTICLE_POOL_SIZE: 500,
  SPATIAL_HASH_CELL_SIZE: 64,
  
  // Typography
  FONT: {
    DISPLAY: 'Orbitron',
    UI: 'Rajdhani',
    MONO: 'Courier New',
  },
  
  // Animation timings
  ANIMATION: {
    SCENE_TRANSITION: 300,
    TEXT_BLINK: 500,
    WAVE_DISPLAY: 2000,
    DAMAGE_FLASH: 100,
  },
} as const;
