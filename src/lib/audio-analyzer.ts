/**
 * Audio Analyzer Service
 * Analyzes audio files for beat detection, volume levels, and frequency spectrum
 */

export interface AudioAnalysisResult {
  duration: number;
  sampleRate: number;
  channels: number;
  bpm: number;
  averageVolume: number;
  peakVolume: number;
  frequencySpectrum: number[];
  beats: BeatMarker[];
  energyProfile: EnergyProfile;
  genre: string;
}

export interface BeatMarker {
  time: number;
  strength: number;
  frequency: string;
}

export interface EnergyProfile {
  low: number[];
  mid: number[];
  high: number[];
  overall: number[];
}

class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  /**
   * Initialize AudioContext and AnalyserNode
   */
  private async initializeAudioContext(): Promise<void> {
    if (this.audioContext) return;
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
  }

  /**
   * Analyze audio file and extract all metrics
   */
  async analyzeAudio(file: File): Promise<AudioAnalysisResult> {
    await this.initializeAudioContext();

    if (!this.audioContext) {
      throw new Error('AudioContext initialization failed');
    }

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const duration = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;

    // Extract audio data from first channel
    const audioData = audioBuffer.getChannelData(0);

    // Analyze different metrics
    const { averageVolume, peakVolume } = this.analyzeVolume(audioData);
    const bpm = this.detectBPM(audioData, sampleRate);
    const frequencySpectrum = this.analyzeFrequency(audioData);
    const beats = this.detectBeats(audioData, sampleRate, bpm);
    const energyProfile = this.analyzeEnergy(audioData, sampleRate);
    const genre = this.suggestGenre(bpm, averageVolume, frequencySpectrum);

    return {
      duration,
      sampleRate,
      channels,
      bpm,
      averageVolume,
      peakVolume,
      frequencySpectrum,
      beats,
      energyProfile,
      genre,
    };
  }

  /**
   * Analyze volume levels in audio data
   */
  private analyzeVolume(audioData: Float32Array): { averageVolume: number; peakVolume: number } {
    let sum = 0;
    let max = 0;

    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.abs(audioData[i]);
      sum += sample;
      max = Math.max(max, sample);
    }

    const averageVolume = sum / audioData.length;
    return {
      averageVolume: Math.round(averageVolume * 100),
      peakVolume: Math.round(max * 100),
    };
  }

  /**
   * Detect BPM using autocorrelation method
   */
  private detectBPM(audioData: Float32Array, sampleRate: number): number {
    // Use a simplified beat detection algorithm
    // This is a basic implementation; production should use more sophisticated methods
    
    const windowSize = Math.floor(sampleRate * 0.5); // 500ms window
    let maxEnergy = 0;
    let maxLag = 0;

    // Analyze energy in different frequency bands
    for (let lag = Math.floor(sampleRate * 0.3); lag < Math.floor(sampleRate * 1.2); lag++) {
      let energy = 0;
      for (let i = 0; i < audioData.length - lag; i++) {
        energy += audioData[i] * audioData[i + lag];
      }
      if (energy > maxEnergy) {
        maxEnergy = energy;
        maxLag = lag;
      }
    }

    // Convert lag to BPM
    const bpm = Math.round((sampleRate / maxLag) * 60);
    
    // Constrain to realistic range (40-200 BPM)
    return Math.max(40, Math.min(200, bpm));
  }

  /**
   * Analyze frequency spectrum using FFT
   */
  private analyzeFrequency(audioData: Float32Array): number[] {
    const fftSize = 1024;
    const spectrum: number[] = new Array(fftSize / 2).fill(0);

    // Perform simple FFT analysis on chunks
    const numChunks = Math.floor(audioData.length / fftSize);
    
    for (let chunk = 0; chunk < Math.min(numChunks, 10); chunk++) {
      const chunkData = audioData.slice(chunk * fftSize, (chunk + 1) * fftSize);
      const fft = this.simpleFFT(chunkData);
      
      for (let i = 0; i < spectrum.length; i++) {
        spectrum[i] += fft[i];
      }
    }

    // Average and normalize
    return spectrum.map((val) => val / Math.min(numChunks, 10) / 1000).slice(0, 128);
  }

  /**
   * Simple FFT implementation (Cooley-Tukey algorithm)
   */
  private simpleFFT(data: Float32Array): number[] {
    const n = data.length;
    if (n <= 1) return Array.from(data);

    const result: number[] = new Array(n).fill(0);
    
    // Apply Hann window
    const windowed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      windowed[i] = data[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
    }

    // Calculate magnitude spectrum
    for (let i = 0; i < n / 2; i++) {
      let real = 0;
      let imag = 0;
      
      for (let k = 0; k < n; k++) {
        const angle = (-2 * Math.PI * i * k) / n;
        real += windowed[k] * Math.cos(angle);
        imag += windowed[k] * Math.sin(angle);
      }
      
      result[i] = Math.sqrt(real * real + imag * imag);
    }

    return result;
  }

  /**
   * Detect beat markers in audio
   */
  private detectBeats(audioData: Float32Array, sampleRate: number, bpm: number): BeatMarker[] {
    const beats: BeatMarker[] = [];
    const beatInterval = (60 / bpm) * sampleRate; // samples per beat
    const windowSize = Math.floor(beatInterval / 2);

    let currentTime = 0;
    
    for (let i = 0; i < audioData.length; i += beatInterval) {
      const start = Math.max(0, i - windowSize);
      const end = Math.min(audioData.length, i + windowSize);
      
      let energy = 0;
      for (let j = start; j < end; j++) {
        energy += audioData[j] * audioData[j];
      }
      
      const strength = Math.sqrt(energy / (end - start));
      
      if (strength > 0.1) {
        const frequency = this.getFrequencyRange(strength);
        beats.push({
          time: currentTime,
          strength: Math.round(strength * 100),
          frequency,
        });
      }
      
      currentTime = i / sampleRate;
    }

    return beats.slice(0, 100); // Limit to first 100 beats
  }

  /**
   * Determine frequency range based on strength
   */
  private getFrequencyRange(strength: number): string {
    if (strength > 0.3) return 'high';
    if (strength > 0.15) return 'mid';
    return 'low';
  }

  /**
   * Analyze energy profile across frequency bands
   */
  private analyzeEnergy(audioData: Float32Array, sampleRate: number): EnergyProfile {
    const chunkSize = Math.floor(sampleRate * 0.1); // 100ms chunks
    const low: number[] = [];
    const mid: number[] = [];
    const high: number[] = [];
    const overall: number[] = [];

    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(i, Math.min(i + chunkSize, audioData.length));
      const spectrum = this.simpleFFT(chunk);

      // Divide spectrum into bands
      const bandSize = Math.floor(spectrum.length / 3);
      
      const lowEnergy = spectrum.slice(0, bandSize).reduce((a, b) => a + b, 0) / bandSize;
      const midEnergy = spectrum.slice(bandSize, bandSize * 2).reduce((a, b) => a + b, 0) / bandSize;
      const highEnergy = spectrum.slice(bandSize * 2).reduce((a, b) => a + b, 0) / bandSize;
      const overallEnergy = spectrum.reduce((a, b) => a + b, 0) / spectrum.length;

      low.push(Math.round(lowEnergy));
      mid.push(Math.round(midEnergy));
      high.push(Math.round(highEnergy));
      overall.push(Math.round(overallEnergy));
    }

    return { low, mid, high, overall };
  }

  /**
   * Suggest genre based on audio characteristics
   */
  private suggestGenre(bpm: number, averageVolume: number, frequencySpectrum: number[]): string {
    // Simple genre detection based on BPM and frequency characteristics
    
    if (bpm < 90) {
      return 'chill';
    } else if (bpm < 120) {
      return 'pop';
    } else if (bpm < 140) {
      return 'dance';
    } else if (bpm < 180) {
      return 'edm';
    } else {
      return 'dnb';
    }
  }
}

// Export singleton instance
export const audioAnalyzer = new AudioAnalyzer();
