/**
 * Template Runtime System
 * Manages visualizer templates, animations, particles, and waveform styles
 */

export interface AnimationConfig {
  type: 'bars' | 'circles' | 'waves' | 'particles' | 'spectrum' | 'waveform';
  duration: number;
  easing: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut' | 'bounce';
  intensity: number;
  speed: number;
}

export interface ParticleConfig {
  enabled: boolean;
  count: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  lifespan: number;
}

export interface WaveformStyle {
  type: 'bars' | 'line' | 'circular' | 'radial' | 'spectrogram';
  thickness: number;
  smoothing: number;
  mirror: boolean;
  rotation: number;
}

export interface ColorSystem {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string[];
  mode: 'solid' | 'gradient' | 'spectrum' | 'reactive';
}

export interface TransitionConfig {
  type: 'fade' | 'slide' | 'zoom' | 'rotate' | 'blur';
  duration: number;
  easing: string;
}

export interface TemplateConfiguration {
  id: string;
  name: string;
  description: string;
  category: 'edm' | 'chill' | 'anime' | 'neon' | 'minimal' | 'abstract';
  thumbnail: string;
  
  // Animation settings
  animations: AnimationConfig[];
  
  // Particle system
  particles: ParticleConfig;
  
  // Waveform visualization
  waveform: WaveformStyle;
  
  // Color scheme
  colors: ColorSystem;
  
  // Transitions
  transitions: TransitionConfig;
  
  // Performance settings
  quality: 'low' | 'medium' | 'high' | 'ultra';
  fps: number;
  resolution: '720p' | '1080p' | '1440p' | '4k';
}

export class TemplateRuntime {
  private templates: Map<string, TemplateConfiguration> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    this.registerTemplate({
      id: 'edm-circle',
      name: 'EDM Circle',
      description: 'Energetic geometric pulses in circular formation',
      category: 'edm',
      thumbnail: '/templates/edm-circle.jpg',
      animations: [
        {
          type: 'circles',
          duration: 500,
          easing: 'easeInOut',
          intensity: 1.2,
          speed: 1,
        },
      ],
      particles: {
        enabled: true,
        count: 80,
        size: 3,
        speed: 2,
        opacity: 0.8,
        color: '#73E0FF',
        lifespan: 2000,
      },
      waveform: {
        type: 'circular',
        thickness: 2,
        smoothing: 0.8,
        mirror: true,
        rotation: 0,
      },
      colors: {
        primary: '#634CFF',
        secondary: '#73E0FF',
        accent: '#FF006E',
        background: '#201E2E',
        gradient: ['#634CFF', '#73E0FF', '#FF006E'],
        mode: 'gradient',
      },
      transitions: {
        type: 'zoom',
        duration: 300,
        easing: 'easeOut',
      },
      quality: 'high',
      fps: 60,
      resolution: '1080p',
    });

    this.registerTemplate({
      id: 'chill-player',
      name: 'Chill Wave',
      description: 'Smooth ambient lines with minimal design',
      category: 'chill',
      thumbnail: '/templates/chill-player.jpg',
      animations: [
        {
          type: 'waves',
          duration: 2000,
          easing: 'linear',
          intensity: 0.6,
          speed: 0.5,
        },
      ],
      particles: {
        enabled: false,
        count: 0,
        size: 0,
        speed: 0,
        opacity: 0,
        color: '#73E0FF',
        lifespan: 0,
      },
      waveform: {
        type: 'line',
        thickness: 1,
        smoothing: 0.95,
        mirror: true,
        rotation: 0,
      },
      colors: {
        primary: '#73E0FF',
        secondary: '#634CFF',
        accent: '#FFFFFF',
        background: '#201E2E',
        gradient: ['#634CFF', '#73E0FF'],
        mode: 'solid',
      },
      transitions: {
        type: 'fade',
        duration: 500,
        easing: 'linear',
      },
      quality: 'medium',
      fps: 30,
      resolution: '1080p',
    });

    this.registerTemplate({
      id: 'anime-style',
      name: 'Digital Anime',
      description: 'Expressive aesthetic visuals with dynamic effects',
      category: 'anime',
      thumbnail: '/templates/anime-style.jpg',
      animations: [
        {
          type: 'bars',
          duration: 300,
          easing: 'bounce',
          intensity: 0.8,
          speed: 1.5,
        },
      ],
      particles: {
        enabled: true,
        count: 120,
        size: 2,
        speed: 3,
        opacity: 0.6,
        color: '#FF006E',
        lifespan: 1500,
      },
      waveform: {
        type: 'bars',
        thickness: 3,
        smoothing: 0.6,
        mirror: false,
        rotation: 0,
      },
      colors: {
        primary: '#FF006E',
        secondary: '#73E0FF',
        accent: '#FFD60A',
        background: '#201E2E',
        gradient: ['#FF006E', '#FFD60A', '#73E0FF'],
        mode: 'spectrum',
      },
      transitions: {
        type: 'rotate',
        duration: 400,
        easing: 'easeInOut',
      },
      quality: 'high',
      fps: 60,
      resolution: '1080p',
    });

    this.registerTemplate({
      id: 'neon-wave',
      name: 'Cyber Neon',
      description: 'Retro glowing waveforms with cyberpunk aesthetic',
      category: 'neon',
      thumbnail: '/templates/neon-wave.jpg',
      animations: [
        {
          type: 'waveform',
          duration: 1000,
          easing: 'linear',
          intensity: 1.2,
          speed: 1,
        },
      ],
      particles: {
        enabled: true,
        count: 100,
        size: 4,
        speed: 1.5,
        opacity: 0.7,
        color: '#00FF00',
        lifespan: 2500,
      },
      waveform: {
        type: 'spectrogram',
        thickness: 2,
        smoothing: 0.7,
        mirror: true,
        rotation: 0,
      },
      colors: {
        primary: '#00FF00',
        secondary: '#00FFFF',
        accent: '#FF00FF',
        background: '#0A0E27',
        gradient: ['#00FF00', '#00FFFF', '#FF00FF'],
        mode: 'reactive',
      },
      transitions: {
        type: 'blur',
        duration: 250,
        easing: 'easeOut',
      },
      quality: 'ultra',
      fps: 60,
      resolution: '1440p',
    });

    this.registerTemplate({
      id: 'minimal-spectrum',
      name: 'Minimal Spectrum',
      description: 'Clean frequency spectrum visualization',
      category: 'minimal',
      thumbnail: '/templates/minimal-spectrum.jpg',
      animations: [
        {
          type: 'spectrum',
          duration: 100,
          easing: 'linear',
          intensity: 1,
          speed: 1,
        },
      ],
      particles: {
        enabled: false,
        count: 0,
        size: 0,
        speed: 0,
        opacity: 0,
        color: '#FFFFFF',
        lifespan: 0,
      },
      waveform: {
        type: 'bars',
        thickness: 1,
        smoothing: 0.5,
        mirror: false,
        rotation: 0,
      },
      colors: {
        primary: '#FFFFFF',
        secondary: '#808080',
        accent: '#404040',
        background: '#000000',
        gradient: ['#FFFFFF', '#808080'],
        mode: 'solid',
      },
      transitions: {
        type: 'fade',
        duration: 200,
        easing: 'linear',
      },
      quality: 'high',
      fps: 60,
      resolution: '1080p',
    });
  }

  /**
   * Register a new template
   */
  registerTemplate(config: TemplateConfiguration): void {
    this.templates.set(config.id, config);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): TemplateConfiguration | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get all templates
   */
  getAllTemplates(): TemplateConfiguration[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): TemplateConfiguration[] {
    return Array.from(this.templates.values()).filter((t) => t.category === category);
  }

  /**
   * Merge custom settings with template
   */
  mergeSettings(
    templateId: string,
    customSettings: Partial<TemplateConfiguration>
  ): TemplateConfiguration | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return {
      ...template,
      ...customSettings,
      animations: customSettings.animations || template.animations,
      particles: { ...template.particles, ...customSettings.particles },
      waveform: { ...template.waveform, ...customSettings.waveform },
      colors: { ...template.colors, ...customSettings.colors },
      transitions: { ...template.transitions, ...customSettings.transitions },
    };
  }

  /**
   * Validate template configuration
   */
  validateTemplate(config: TemplateConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) errors.push('Template ID is required');
    if (!config.name) errors.push('Template name is required');
    if (!config.category) errors.push('Template category is required');
    if (!config.animations || config.animations.length === 0) errors.push('At least one animation is required');
    if (config.particles.count < 0) errors.push('Particle count cannot be negative');
    if (config.fps < 1 || config.fps > 120) errors.push('FPS must be between 1 and 120');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export template configuration as JSON
   */
  exportTemplate(id: string): string | null {
    const template = this.getTemplate(id);
    if (!template) return null;
    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template configuration from JSON
   */
  importTemplate(json: string): TemplateConfiguration | null {
    try {
      const config = JSON.parse(json) as TemplateConfiguration;
      const validation = this.validateTemplate(config);
      if (!validation.valid) {
        console.error('Invalid template configuration:', validation.errors);
        return null;
      }
      this.registerTemplate(config);
      return config;
    } catch (error) {
      console.error('Error importing template:', error);
      return null;
    }
  }
}

// Export singleton instance
export const templateRuntime = new TemplateRuntime();
