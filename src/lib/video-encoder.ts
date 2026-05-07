/**
 * Video Encoder Service
 * Handles video rendering and encoding from canvas frames
 */

import { TemplateConfiguration } from './template-runtime';
import { AudioAnalysisResult } from './audio-analyzer';

export interface VideoEncoderConfig {
  fps: number;
  resolution: '720p' | '1080p' | '1440p' | '4k';
  bitrate: number;
  codec: 'h264' | 'vp8' | 'vp9';
}

export interface EncodingProgress {
  framesProcessed: number;
  totalFrames: number;
  percentage: number;
  currentPhase: 'rendering' | 'encoding' | 'finalizing';
}

class VideoEncoder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;

  /**
   * Get resolution dimensions
   */
  private getResolutionDimensions(resolution: string): { width: number; height: number } {
    switch (resolution) {
      case '720p':
        return { width: 1280, height: 720 };
      case '1080p':
        return { width: 1920, height: 1080 };
      case '1440p':
        return { width: 2560, height: 1440 };
      case '4k':
        return { width: 3840, height: 2160 };
      default:
        return { width: 1920, height: 1080 };
    }
  }

  /**
   * Get bitrate based on resolution and quality
   */
  private getBitrate(resolution: string, quality: string): number {
    const baseRates: Record<string, number> = {
      '720p': 2500,
      '1080p': 5000,
      '1440p': 8000,
      '4k': 15000,
    };

    const qualityMultipliers: Record<string, number> = {
      low: 0.5,
      medium: 0.75,
      high: 1,
      ultra: 1.5,
    };

    const baseRate = baseRates[resolution] || 5000;
    const multiplier = qualityMultipliers[quality] || 1;

    return Math.floor(baseRate * multiplier);
  }

  /**
   * Initialize video encoder
   */
  async initializeEncoder(
    canvas: HTMLCanvasElement,
    config: VideoEncoderConfig
  ): Promise<void> {
    this.canvas = canvas;
    this.recordedChunks = [];

    // Get canvas stream
    const stream = canvas.captureStream(config.fps);
    this.stream = stream;

    // Create media recorder
    const mimeType = this.getSupportedMimeType();
    const mediaRecorderOptions: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: config.bitrate * 1000,
    };

    this.mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
  }

  /**
   * Get supported MIME type
   */
  private getSupportedMimeType(): string {
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return 'video/webm';
  }

  /**
   * Start recording
   */
  startRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.recordedChunks = [];
      this.mediaRecorder.start();
    }
  }

  /**
   * Stop recording and get blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Media recorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };

      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      } else {
        resolve(new Blob(this.recordedChunks, { type: 'video/webm' }));
      }
    });
  }

  /**
   * Render video from canvas with audio
   */
  async renderVideo(
    canvas: HTMLCanvasElement,
    audioFile: File,
    template: TemplateConfiguration,
    analysisResult: AudioAnalysisResult,
    onProgress?: (progress: EncodingProgress) => void
  ): Promise<Blob> {
    const dims = this.getResolutionDimensions(template.resolution);
    const bitrate = this.getBitrate(template.resolution, template.quality);

    // Resize canvas to target resolution
    canvas.width = dims.width;
    canvas.height = dims.height;

    const config: VideoEncoderConfig = {
      fps: template.fps,
      resolution: template.resolution,
      bitrate,
      codec: 'vp8',
    };

    await this.initializeEncoder(canvas, config);

    // Calculate total frames
    const duration = analysisResult.duration;
    const totalFrames = Math.ceil(duration * template.fps);

    // Start recording
    this.startRecording();

    // Simulate frame rendering
    for (let i = 0; i < totalFrames; i++) {
      const progress: EncodingProgress = {
        framesProcessed: i,
        totalFrames,
        percentage: (i / totalFrames) * 100,
        currentPhase: 'rendering',
      };

      onProgress?.(progress);

      // Wait for frame time
      await new Promise((resolve) => setTimeout(resolve, 1000 / template.fps));
    }

    // Stop recording
    const videoBlob = await this.stopRecording();

    // Merge with audio
    const finalBlob = await this.mergeAudioWithVideo(videoBlob, audioFile);

    onProgress?.({
      framesProcessed: totalFrames,
      totalFrames,
      percentage: 100,
      currentPhase: 'finalizing',
    });

    return finalBlob;
  }

  /**
   * Merge audio with video
   */
  private async mergeAudioWithVideo(videoBlob: Blob, audioFile: File): Promise<Blob> {
    // For now, return video blob as-is
    // In production, this would use FFmpeg or similar to merge audio and video
    // This is a placeholder that would need proper implementation
    return videoBlob;
  }

  /**
   * Export video as download URL
   */
  exportVideoAsUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Upload video to storage
   */
  async uploadVideoToStorage(blob: Blob, fileName: string): Promise<string> {
    // This would be implemented with Firebase Storage or similar
    // For now, return a data URL
    return this.exportVideoAsUrl(blob);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
}

export const videoEncoder = new VideoEncoder();
