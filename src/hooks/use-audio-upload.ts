/**
 * useAudioUpload Hook
 * Manages audio file upload, analysis, and storage
 */

import { useState, useCallback } from 'react';
import { audioAnalyzer, AudioAnalysisResult } from '@/lib/audio-analyzer';
import { firebaseStorageService, MediaAssetMetadata, AudioAnalysisMetadata } from '@/firebase/storage-service';
import { useUser } from '@/firebase/provider';
import { useFirebaseApp } from '@/firebase/provider';

export interface UploadState {
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: number;
  error: string | null;
  mediaAsset: MediaAssetMetadata | null;
  analysisResult: AudioAnalysisResult | null;
}

export function useAudioUpload() {
  const userResult = useUser();
  const firebaseApp = useFirebaseApp();
  const user = userResult && 'uid' in userResult ? (userResult as any) : null;
  
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    isAnalyzing: false,
    uploadProgress: 0,
    error: null,
    mediaAsset: null,
    analysisResult: null,
  });

  /**
   * Upload and analyze audio file
   */
  const uploadAndAnalyzeAudio = useCallback(
    async (file: File) => {
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
        // Initialize Firebase app in storage service
        firebaseStorageService.setFirebaseApp(firebaseApp);

        // Start upload
        setState((prev) => ({
          ...prev,
          isUploading: true,
          error: null,
        }));

        // Upload file
        const mediaAsset = await firebaseStorageService.uploadAudioFile(
          user.uid,
          file,
          (progress) => {
            setState((prev) => ({
              ...prev,
              uploadProgress: progress,
            }));
          }
        );

        setState((prev) => ({
          ...prev,
          isUploading: false,
          mediaAsset,
        }));

        // Start analysis
        setState((prev) => ({
          ...prev,
          isAnalyzing: true,
        }));

        const analysisResult = await audioAnalyzer.analyzeAudio(file);

        // Save analysis to Firestore
        const analysisMetadata: AudioAnalysisMetadata = {
          mediaAssetId: mediaAsset.id,
          bpm: analysisResult.bpm,
          averageVolume: analysisResult.averageVolume,
          peakVolume: analysisResult.peakVolume,
          genre: analysisResult.genre,
          duration: analysisResult.duration,
          analysisDate: new Date(),
        };

        await firebaseStorageService.saveAudioAnalysis(user.uid, mediaAsset.id, analysisMetadata);

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          analysisResult,
        }));

        return {
          mediaAsset,
          analysisResult,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState((prev) => ({
          ...prev,
          isUploading: false,
          isAnalyzing: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [user?.uid, firebaseApp]
  );

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      isAnalyzing: false,
      uploadProgress: 0,
      error: null,
      mediaAsset: null,
      analysisResult: null,
    });
  }, []);

  return {
    ...state,
    uploadAndAnalyzeAudio,
    reset,
  };
}
