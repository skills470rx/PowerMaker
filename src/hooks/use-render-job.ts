/**
 * useRenderJob Hook
 * Manages video rendering jobs and encoding
 */

import { useState, useCallback, useEffect } from 'react';
import { renderQueueService, RenderJob, RenderJobConfig } from '@/firebase/render-queue-service';
import { videoEncoder, EncodingProgress } from '@/lib/video-encoder';
import { useUser } from '@/firebase/provider';
import { useFirebaseApp } from '@/firebase/provider';
import { TemplateConfiguration } from '@/lib/template-runtime';
import { AudioAnalysisResult } from '@/lib/audio-analyzer';

export interface RenderJobState {
  job: RenderJob | null;
  isRendering: boolean;
  progress: number;
  encodingPhase: 'rendering' | 'encoding' | 'finalizing' | null;
  error: string | null;
  outputUrl: string | null;
}

export function useRenderJob() {
  const userResult = useUser();
  const firebaseApp = useFirebaseApp();
  const user = userResult && 'uid' in userResult ? (userResult as any) : null;

  const [state, setState] = useState<RenderJobState>({
    job: null,
    isRendering: false,
    progress: 0,
    encodingPhase: null,
    error: null,
    outputUrl: null,
  });

  /**
   * Create and start render job
   */
  const startRenderJob = useCallback(
    async (
      projectId: string,
      config: RenderJobConfig,
      canvas: HTMLCanvasElement,
      audioFile: File,
      imageFile: File | null,
      template: TemplateConfiguration,
      analysisResult: AudioAnalysisResult
    ) => {
      if (!user || !('uid' in user) || !user.uid) {
        setState((prev) => ({
          ...prev,
          error: 'User not authenticated',
        }));
        return;
      }

      if (!firebaseApp) {
        setState((prev) => ({
          ...prev,
          error: 'Firebase not initialized',
        }));
        return;
      }

      try {
        // Initialize services
        renderQueueService.setFirebaseApp(firebaseApp);

        // Create render job
        setState((prev) => ({
          ...prev,
          isRendering: true,
          error: null,
        }));

        const job = await renderQueueService.createRenderJob(user.uid, projectId, config);
        setState((prev) => ({
          ...prev,
          job,
        }));

        // Update job status to processing
        await renderQueueService.updateRenderJobProgress(user.uid, projectId, job.id, 0, 'processing');

        // Start video encoding
        const videoBlob = await videoEncoder.renderVideo(
          canvas,
          audioFile,
          template,
          analysisResult,
          (progress: EncodingProgress) => {
            setState((prev) => ({
              ...prev,
              progress: progress.percentage,
              encodingPhase: progress.currentPhase,
            }));

            // Update job progress
            renderQueueService.updateRenderJobProgress(
              user.uid,
              projectId,
              job.id,
              progress.percentage,
              progress.currentPhase === 'rendering' ? 'processing' : 'encoding'
            );
          }
        );

        // Update job status to encoding
        await renderQueueService.updateRenderJobProgress(user.uid, projectId, job.id, 100, 'encoding');

        // Upload video
        const outputUrl = videoEncoder.exportVideoAsUrl(videoBlob);

        // Complete job
        await renderQueueService.completeRenderJob(user.uid, projectId, job.id, outputUrl);

        setState((prev) => ({
          ...prev,
          isRendering: false,
          progress: 100,
          encodingPhase: null,
          outputUrl,
        }));

        return {
          job,
          outputUrl,
          videoBlob,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState((prev) => ({
          ...prev,
          isRendering: false,
          error: errorMessage,
        }));
        throw error;
      } finally {
        videoEncoder.cleanup();
      }
    },
    [user?.uid, firebaseApp]
  );

  /**
   * Get render job status
   */
  const getRenderJobStatus = useCallback(
    async (projectId: string, jobId: string) => {
      if (!user || !('uid' in user) || !user.uid) {
        setState((prev) => ({
          ...prev,
          error: 'User not authenticated',
        }));
        return null;
      }

      if (!firebaseApp) {
        setState((prev) => ({
          ...prev,
          error: 'Firebase not initialized',
        }));
        return null;
      }

      try {
        renderQueueService.setFirebaseApp(firebaseApp);
        const job = await renderQueueService.getRenderJob(user.uid, projectId, jobId);
        setState((prev) => ({
          ...prev,
          job,
        }));
        return job;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        return null;
      }
    },
    [user?.uid, firebaseApp]
  );

  /**
   * Subscribe to render job updates
   */
  const subscribeToRenderJob = useCallback(
    (projectId: string, jobId: string) => {
      if (!user?.uid || !firebaseApp) {
        return () => {};
      }

      renderQueueService.setFirebaseApp(firebaseApp);

      return renderQueueService.subscribeToRenderJob(user.uid, projectId, jobId, (job) => {
        setState((prev) => ({
          ...prev,
          job,
          progress: job.progressPercentage,
          isRendering: job.status === 'processing' || job.status === 'encoding',
          outputUrl: job.outputVideoUrl,
        }));
      });
    },
    [user?.uid, firebaseApp]
  );

  /**
   * Reset render state
   */
  const reset = useCallback(() => {
    setState({
      job: null,
      isRendering: false,
      progress: 0,
      encodingPhase: null,
      error: null,
      outputUrl: null,
    });
  }, []);

  return {
    ...state,
    startRenderJob,
    getRenderJobStatus,
    subscribeToRenderJob,
    reset,
  };
}
