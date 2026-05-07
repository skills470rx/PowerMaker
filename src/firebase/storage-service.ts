/**
 * Firebase Storage Service
 * Handles uploading media files to Firebase Storage and managing references
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

export interface MediaAssetMetadata {
  id: string;
  userId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  downloadUrl: string;
  uploadedAt: Date;
  type: 'audio' | 'image';
}

export interface AudioAnalysisMetadata {
  mediaAssetId: string;
  bpm: number;
  averageVolume: number;
  peakVolume: number;
  genre: string;
  duration: number;
  analysisDate: Date;
  frequencySpectrumUrl?: string;
}

class FirebaseStorageService {
  private app: FirebaseApp | null = null;

  /**
   * Initialize Firebase app reference
   */
  setFirebaseApp(app: FirebaseApp): void {
    this.app = app;
  }

  /**
   * Upload audio file to Firebase Storage
   */
  async uploadAudioFile(
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<MediaAssetMetadata> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const storage = getStorage(this.app);
    const firestore = getFirestore(this.app);

    // Create storage path
    const timestamp = Date.now();
    const storagePath = `users/${userId}/audio/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    try {
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      const mediaAssetRef = collection(firestore, `users/${userId}/mediaAssets`);
      const docRef = await addDoc(mediaAssetRef, {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storagePath,
        downloadUrl,
        uploadedAt: new Date(),
        type: 'audio',
        userId,
      });

      return {
        id: docRef.id,
        userId,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storagePath,
        downloadUrl,
        uploadedAt: new Date(),
        type: 'audio',
      };
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw error;
    }
  }

  /**
   * Upload image file to Firebase Storage
   */
  async uploadImageFile(
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<MediaAssetMetadata> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const storage = getStorage(this.app);
    const firestore = getFirestore(this.app);

    // Create storage path
    const timestamp = Date.now();
    const storagePath = `users/${userId}/images/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    try {
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      const mediaAssetRef = collection(firestore, `users/${userId}/mediaAssets`);
      const docRef = await addDoc(mediaAssetRef, {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storagePath,
        downloadUrl,
        uploadedAt: new Date(),
        type: 'image',
        userId,
      });

      return {
        id: docRef.id,
        userId,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storagePath,
        downloadUrl,
        uploadedAt: new Date(),
        type: 'image',
      };
    } catch (error) {
      console.error('Error uploading image file:', error);
      throw error;
    }
  }

  /**
   * Save audio analysis results to Firestore
   */
  async saveAudioAnalysis(
    userId: string,
    mediaAssetId: string,
    analysis: AudioAnalysisMetadata
  ): Promise<string> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const analysisRef = collection(
        firestore,
        `users/${userId}/mediaAssets/${mediaAssetId}/audioAnalysisResults`
      );
      
      const docRef = await addDoc(analysisRef, {
        ...analysis,
        analysisDate: new Date(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error saving audio analysis:', error);
      throw error;
    }
  }

  /**
   * Get audio analysis for a media asset
   */
  async getAudioAnalysis(
    userId: string,
    mediaAssetId: string
  ): Promise<AudioAnalysisMetadata | null> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const analysisRef = collection(
        firestore,
        `users/${userId}/mediaAssets/${mediaAssetId}/audioAnalysisResults`
      );
      
      const q = query(analysisRef);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return doc.data() as AudioAnalysisMetadata;
    } catch (error) {
      console.error('Error getting audio analysis:', error);
      return null;
    }
  }

  /**
   * Get media asset by ID
   */
  async getMediaAsset(userId: string, mediaAssetId: string): Promise<MediaAssetMetadata | null> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const docRef = doc(firestore, `users/${userId}/mediaAssets/${mediaAssetId}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as MediaAssetMetadata;
    } catch (error) {
      console.error('Error getting media asset:', error);
      return null;
    }
  }

  /**
   * List all media assets for a user
   */
  async listMediaAssets(userId: string, type?: 'audio' | 'image'): Promise<MediaAssetMetadata[]> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const mediaAssetRef = collection(firestore, `users/${userId}/mediaAssets`);
      let q;

      if (type) {
        q = query(mediaAssetRef, where('type', '==', type));
      } else {
        q = query(mediaAssetRef);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaAssetMetadata[];
    } catch (error) {
      console.error('Error listing media assets:', error);
      return [];
    }
  }

  /**
   * Delete media asset and its storage file
   */
  async deleteMediaAsset(userId: string, mediaAssetId: string, storagePath: string): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const storage = getStorage(this.app);
    const firestore = getFirestore(this.app);

    try {
      // Delete from storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      const docRef = doc(firestore, `users/${userId}/mediaAssets/${mediaAssetId}`);
      await updateDoc(docRef, { deletedAt: new Date() });
    } catch (error) {
      console.error('Error deleting media asset:', error);
      throw error;
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
