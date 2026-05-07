/**
 * useImageUpload Hook
 * Manages image file upload and storage
 */

import { useState, useCallback } from 'react';
import { firebaseStorageService, MediaAssetMetadata } from '@/firebase/storage-service';
import { useUser } from '@/firebase/provider';
import { useFirebaseApp } from '@/firebase/provider';

export interface ImageUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  mediaAsset: MediaAssetMetadata | null;
}

export function useImageUpload() {
  const userResult = useUser();
  const firebaseApp = useFirebaseApp();
  const user = userResult && 'uid' in userResult ? (userResult as any) : null;

  const [state, setState] = useState<ImageUploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    mediaAsset: null,
  });

  /**
   * Upload image file
   */
  const uploadImage = useCallback(
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
        const mediaAsset = await firebaseStorageService.uploadImageFile(
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

        return mediaAsset;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState((prev) => ({
          ...prev,
          isUploading: false,
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
      uploadProgress: 0,
      error: null,
      mediaAsset: null,
    });
  }, []);

  return {
    ...state,
    uploadImage,
    reset,
  };
}
