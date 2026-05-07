/**
 * Canvas Render Engine
 * Handles real-time rendering of visualizations on Canvas
 */

import { TemplateConfiguration, AnimationConfig, ParticleConfig, WaveformStyle } from './template-runtime';
import { AudioAnalysisResult } from './audio-analyzer';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  audioData: Float32Array;
  frequencyData: Uint8Array;
  analysisResult: AudioAnalysisResult;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  lifespan: number;
  age: number;
}

export class CanvasRenderEngine {
  private animationFrameId: number | null = null;
  private particles: Particle[] = [];
  private time: number = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;

  /**
   * Initialize render engine with audio context
   */
  async initializeAudio(audioFile: File): Promise<void> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  /**
   * Start rendering animation
   */
  startRender(
    canvas: HTMLCanvasElement,
    template: TemplateConfiguration,
    analysisResult: AudioAnalysisResult,
    imageFile?: File,
    onFrame?: (frameNumber: number) => void
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameNumber = 0;
    const renderFrame = () => {
      this.time += 1 / (template.fps || 60);
      frameNumber++;

      // Update frequency data
      if (this.analyser && this.dataArray) {
        this.analyser.getByteFrequencyData(this.dataArray);
        this.frequencyData = this.dataArray;
      }

      const renderContext: RenderContext = {
        canvas,
        ctx,
        width: canvas.width,
        height: canvas.height,
        time: this.time,
        audioData: new Float32Array(0),
        frequencyData: this.frequencyData || new Uint8Array(0),
        analysisResult,
      };

      // Clear canvas
      this.clearCanvas(renderContext);

      // Draw background image if provided
      if (imageFile) {
        // Background rendering would go here
      }

      // Render animations
      for (const animation of template.animations) {
        this.renderAnimation(renderContext, animation, analysisResult);
      }

      // Render particles
      if (template.particles.enabled) {
        this.updateAndRenderParticles(renderContext, template.particles);
      }

      // Render waveform
      this.renderWaveform(renderContext, template.waveform, analysisResult);

      onFrame?.(frameNumber);
      this.animationFrameId = requestAnimationFrame(renderFrame);
    };

    this.animationFrameId = requestAnimationFrame(renderFrame);
  }

  /**
   * Stop rendering
   */
  stopRender(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Clear canvas with background color
   */
  private clearCanvas(ctx: RenderContext): void {
    ctx.ctx.fillStyle = ctx.ctx.canvas.style.backgroundColor || '#201E2E';
    ctx.ctx.fillRect(0, 0, ctx.width, ctx.height);
  }

  /**
   * Render animation based on type
   */
  private renderAnimation(
    ctx: RenderContext,
    animation: AnimationConfig,
    analysisResult: AudioAnalysisResult
  ): void {
    switch (animation.type) {
      case 'bars':
        this.renderBars(ctx, animation, analysisResult);
        break;
      case 'circles':
        this.renderCircles(ctx, animation, analysisResult);
        break;
      case 'waves':
        this.renderWaves(ctx, animation, analysisResult);
        break;
      case 'spectrum':
        this.renderSpectrum(ctx, animation, analysisResult);
        break;
      default:
        break;
    }
  }

  /**
   * Render vertical bars animation
   */
  private renderBars(
    ctx: RenderContext,
    animation: AnimationConfig,
    analysisResult: AudioAnalysisResult
  ): void {
    const barCount = 64;
    const barWidth = ctx.width / barCount;
    const { frequencyData } = ctx;

    ctx.ctx.fillStyle = '#634CFF';
    ctx.ctx.strokeStyle = '#73E0FF';
    ctx.ctx.lineWidth = 1;

    for (let i = 0; i < barCount; i++) {
      const frequency = frequencyData[i] || 0;
      const height = frequency * ctx.height * animation.intensity;
      const x = i * barWidth;
      const y = ctx.height - height;

      // Draw bar with rounded corners
      ctx.ctx.beginPath();
      ctx.ctx.roundRect(x + 2, y, barWidth - 4, height, 4);
      ctx.ctx.fill();
      ctx.ctx.stroke();
    }
  }

  /**
   * Render circular animation
   */
  private renderCircles(
    ctx: RenderContext,
    animation: AnimationConfig,
    analysisResult: AudioAnalysisResult
  ): void {
    const centerX = ctx.width / 2;
    const centerY = ctx.height / 2;
    const circleCount = 8;
    const { frequencyData } = ctx;

    for (let i = 0; i < circleCount; i++) {
      const frequency = frequencyData[i * 8] || 0;
      const radius = 50 + frequency * 100 * animation.intensity;
      const angle = (i / circleCount) * Math.PI * 2;

      ctx.ctx.fillStyle = `hsla(${(i / circleCount) * 360}, 100%, 50%, ${frequency})`;
      ctx.ctx.beginPath();
      ctx.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.ctx.fill();
    }
  }

  /**
   * Render wave animation
   */
  private renderWaves(
    ctx: RenderContext,
    animation: AnimationConfig,
    analysisResult: AudioAnalysisResult
  ): void {
    const { frequencyData } = ctx;
    const waveCount = 3;
    const amplitude = 30;

    for (let w = 0; w < waveCount; w++) {
      ctx.ctx.strokeStyle = `hsla(${200 + w * 30}, 100%, 50%, ${0.5 - w * 0.1})`;
      ctx.ctx.lineWidth = 2;
      ctx.ctx.beginPath();

      for (let x = 0; x < ctx.width; x += 5) {
        const frequency = frequencyData[Math.floor((x / ctx.width) * frequencyData.length)] || 0;
        const y =
          ctx.height / 2 +
          Math.sin((x / ctx.width) * Math.PI * 2 + this.time * animation.speed) * amplitude * frequency +
          w * 20;

        if (x === 0) {
          ctx.ctx.moveTo(x, y);
        } else {
          ctx.ctx.lineTo(x, y);
        }
      }

      ctx.ctx.stroke();
    }
  }

  /**
   * Render spectrum visualization
   */
  private renderSpectrum(
    ctx: RenderContext,
    animation: AnimationConfig,
    analysisResult: AudioAnalysisResult
  ): void {
    const { frequencyData } = ctx;
    const spectrumBars = 128;
    const barWidth = ctx.width / spectrumBars;

    for (let i = 0; i < spectrumBars; i++) {
      const frequency = frequencyData[i] || 0;
      const hue = (i / spectrumBars) * 360;
      const height = frequency * ctx.height * animation.intensity;

      ctx.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.ctx.fillRect(i * barWidth, ctx.height - height, barWidth - 1, height);
    }
  }

  /**
   * Render waveform visualization
   */
  private renderWaveform(
    ctx: RenderContext,
    waveform: WaveformStyle,
    analysisResult: AudioAnalysisResult
  ): void {
    switch (waveform.type) {
      case 'bars':
        this.renderWaveformBars(ctx, waveform, analysisResult);
        break;
      case 'line':
        this.renderWaveformLine(ctx, waveform, analysisResult);
        break;
      case 'circular':
        this.renderWaveformCircular(ctx, waveform, analysisResult);
        break;
      default:
        break;
    }
  }

  /**
   * Render waveform as bars
   */
  private renderWaveformBars(
    ctx: RenderContext,
    waveform: WaveformStyle,
    analysisResult: AudioAnalysisResult
  ): void {
    const barCount = 32;
    const barWidth = ctx.width / barCount;

    ctx.ctx.fillStyle = '#73E0FF';

    for (let i = 0; i < barCount; i++) {
      const energy = analysisResult.energyProfile.overall[i] || 0;
      const height = (energy / 100) * ctx.height * 0.5;

      ctx.ctx.fillRect(i * barWidth, ctx.height - height, barWidth - 2, height);

      if (waveform.mirror) {
        ctx.ctx.fillRect(i * barWidth, ctx.height / 2, barWidth - 2, height);
      }
    }
  }

  /**
   * Render waveform as line
   */
  private renderWaveformLine(
    ctx: RenderContext,
    waveform: WaveformStyle,
    analysisResult: AudioAnalysisResult
  ): void {
    ctx.ctx.strokeStyle = '#73E0FF';
    ctx.ctx.lineWidth = waveform.thickness;
    ctx.ctx.beginPath();

    const points = analysisResult.energyProfile.overall;
    const pointCount = Math.min(points.length, ctx.width);

    for (let i = 0; i < pointCount; i++) {
      const x = (i / pointCount) * ctx.width;
      const y = ctx.height / 2 - (points[i] / 100) * ctx.height * 0.3;

      if (i === 0) {
        ctx.ctx.moveTo(x, y);
      } else {
        ctx.ctx.lineTo(x, y);
      }
    }

    ctx.ctx.stroke();
  }

  /**
   * Render waveform in circular formation
   */
  private renderWaveformCircular(
    ctx: RenderContext,
    waveform: WaveformStyle,
    analysisResult: AudioAnalysisResult
  ): void {
    const centerX = ctx.width / 2;
    const centerY = ctx.height / 2;
    const radius = Math.min(ctx.width, ctx.height) / 3;
    const points = analysisResult.energyProfile.overall;

    ctx.ctx.strokeStyle = '#73E0FF';
    ctx.ctx.lineWidth = waveform.thickness;
    ctx.ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
      const angle = (i / points.length) * Math.PI * 2 + waveform.rotation;
      const distance = radius + (points[i] / 100) * 50;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      if (i === 0) {
        ctx.ctx.moveTo(x, y);
      } else {
        ctx.ctx.lineTo(x, y);
      }
    }

    ctx.ctx.closePath();
    ctx.ctx.stroke();
  }

  /**
   * Update and render particles
   */
  private updateAndRenderParticles(ctx: RenderContext, particleConfig: ParticleConfig): void {
    // Add new particles based on frequency
    const avgFrequency =
      ctx.frequencyData.reduce((a, b) => a + b, 0) / ctx.frequencyData.length / 255;

    for (let i = 0; i < avgFrequency * particleConfig.count * 0.1; i++) {
      this.particles.push(this.createParticle(ctx, particleConfig));
    }

    // Update and render particles
    this.particles = this.particles.filter((particle) => {
      particle.age += 1 / 60;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // Gravity

      const progress = particle.age / (particle.lifespan / 1000);
      particle.opacity = particleConfig.opacity * (1 - progress);

      if (particle.opacity > 0) {
        ctx.ctx.fillStyle = this.adjustAlpha(particle.color, particle.opacity);
        ctx.ctx.beginPath();
        ctx.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.ctx.fill();
      }

      return particle.opacity > 0;
    });
  }

  /**
   * Create a new particle
   */
  private createParticle(ctx: RenderContext, config: ParticleConfig): Particle {
    return {
      x: Math.random() * ctx.width,
      y: ctx.height,
      vx: (Math.random() - 0.5) * config.speed * 2,
      vy: -Math.random() * config.speed,
      size: config.size,
      opacity: config.opacity,
      color: config.color,
      lifespan: config.lifespan,
      age: 0,
    };
  }

  /**
   * Adjust color alpha
   */
  private adjustAlpha(color: string, alpha: number): string {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Capture frame as image
   */
  captureFrame(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.time;
  }

  /**
   * Reset render state
   */
  reset(): void {
    this.time = 0;
    this.particles = [];
    this.stopRender();
  }
}

export const canvasRenderEngine = new CanvasRenderEngine();
