/**
 * useCanvasPreview Hook
 * Manages real-time canvas preview with template rendering
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { canvasRenderEngine } from '@/lib/canvas-render-engine';
import { TemplateConfiguration } from '@/lib/template-runtime';
import { AudioAnalysisResult } from '@/lib/audio-analyzer';

export interface CanvasPreviewState {
  isRendering: boolean;
  frameNumber: number;
  fps: number;
  error: string | null;
}

export function useCanvasPreview(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  audioFile: File | null,
  imageFile: File | null,
  template: TemplateConfiguration | null,
  analysisResult: AudioAnalysisResult | null,
  isPlaying: boolean
) {
  const [state, setState] = useState<CanvasPreviewState>({
    isRendering: false,
    frameNumber: 0,
    fps: 0,
    error: null,
  });

  const fpsCounterRef = useRef<{ frames: number; lastTime: number }>({
    frames: 0,
    lastTime: Date.now(),
  });

  /**
   * Initialize canvas and start rendering
   */
  useEffect(() => {
    if (!canvasRef.current || !template || !analysisResult || !isPlaying) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setState((prev) => ({ ...prev, error: 'Failed to get canvas context' }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isRendering: true, error: null }));

      // Start rendering
      canvasRenderEngine.startRender(
        canvas,
        template,
        analysisResult,
        imageFile || undefined,
        (frameNumber) => {
          // Update FPS counter
          fpsCounterRef.current.frames++;
          const now = Date.now();
          const elapsed = now - fpsCounterRef.current.lastTime;

          if (elapsed >= 1000) {
            setState((prev) => ({
              ...prev,
              frameNumber,
              fps: fpsCounterRef.current.frames,
            }));
            fpsCounterRef.current.frames = 0;
            fpsCounterRef.current.lastTime = now;
          }
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, error: errorMessage, isRendering: false }));
    }

    return () => {
      canvasRenderEngine.stopRender();
      setState((prev) => ({ ...prev, isRendering: false }));
    };
  }, [canvasRef, template, analysisResult, isPlaying, imageFile]);

  /**
   * Reset preview
   */
  const resetPreview = useCallback(() => {
    canvasRenderEngine.reset();
    setState({
      isRendering: false,
      frameNumber: 0,
      fps: 0,
      error: null,
    });
  }, []);

  /**
   * Capture current frame
   */
  const captureFrame = useCallback(() => {
    if (!canvasRef.current) return null;
    return canvasRenderEngine.captureFrame(canvasRef.current);
  }, [canvasRef]);

  return {
    ...state,
    resetPreview,
    captureFrame,
  };
}
