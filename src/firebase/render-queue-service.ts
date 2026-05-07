/**
 * Render Queue Service
 * Manages video rendering jobs and their lifecycle
 */

import { getFirestore, collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

export type RenderJobStatus = 'queued' | 'processing' | 'encoding' | 'completed' | 'failed';

export interface RenderJobConfig {
  projectId: string;
  audioAssetId: string;
  imageAssetIds: string[];
  templateId: string;
  customSettings: Record<string, any>;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '1440p' | '4k';
  fps: number;
}

export interface RenderJob {
  id: string;
  userId: string;
  projectId: string;
  config: RenderJobConfig;
  status: RenderJobStatus;
  progressPercentage: number;
  startedAt: Date | null;
  completedAt: Date | null;
  outputVideoUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

class RenderQueueService {
  private app: FirebaseApp | null = null;

  /**
   * Initialize Firebase app reference
   */
  setFirebaseApp(app: FirebaseApp): void {
    this.app = app;
  }

  /**
   * Create a new render job
   */
  async createRenderJob(
    userId: string,
    projectId: string,
    config: RenderJobConfig
  ): Promise<RenderJob> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const jobRef = collection(firestore, `users/${userId}/projects/${projectId}/renderJobs`);
      
      const docRef = await addDoc(jobRef, {
        userId,
        projectId,
        config,
        status: 'queued',
        progressPercentage: 0,
        startedAt: null,
        completedAt: null,
        outputVideoUrl: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        updatedAt: data?.updatedAt?.toDate?.() || new Date(),
        startedAt: data?.startedAt?.toDate?.() || null,
        completedAt: data?.completedAt?.toDate?.() || null,
      } as RenderJob;
    } catch (error) {
      console.error('Error creating render job:', error);
      throw error;
    }
  }

  /**
   * Get render job by ID
   */
  async getRenderJob(userId: string, projectId: string, jobId: string): Promise<RenderJob | null> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const docRef = doc(firestore, `users/${userId}/projects/${projectId}/renderJobs/${jobId}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
        startedAt: docSnap.data().startedAt?.toDate?.() || null,
        completedAt: docSnap.data().completedAt?.toDate?.() || null,
      } as RenderJob;
    } catch (error) {
      console.error('Error getting render job:', error);
      return null;
    }
  }

  /**
   * Update render job progress
   */
  async updateRenderJobProgress(
    userId: string,
    projectId: string,
    jobId: string,
    progress: number,
    status?: RenderJobStatus
  ): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const docRef = doc(firestore, `users/${userId}/projects/${projectId}/renderJobs/${jobId}`);
      
      const updateData: any = {
        progressPercentage: Math.min(100, Math.max(0, progress)),
        updatedAt: new Date(),
      };

      if (status) {
        updateData.status = status;
        if (status === 'processing' && !updateData.startedAt) {
          updateData.startedAt = new Date();
        }
        if (status === 'completed' || status === 'failed') {
          updateData.completedAt = new Date();
        }
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating render job progress:', error);
      throw error;
    }
  }

  /**
   * Complete render job with output video URL
   */
  async completeRenderJob(
    userId: string,
    projectId: string,
    jobId: string,
    outputVideoUrl: string
  ): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const docRef = doc(firestore, `users/${userId}/projects/${projectId}/renderJobs/${jobId}`);
      
      await updateDoc(docRef, {
        status: 'completed',
        progressPercentage: 100,
        outputVideoUrl,
        completedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error completing render job:', error);
      throw error;
    }
  }

  /**
   * Fail render job with error message
   */
  async failRenderJob(
    userId: string,
    projectId: string,
    jobId: string,
    errorMessage: string
  ): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const docRef = doc(firestore, `users/${userId}/projects/${projectId}/renderJobs/${jobId}`);
      
      await updateDoc(docRef, {
        status: 'failed',
        errorMessage,
        completedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error failing render job:', error);
      throw error;
    }
  }

  /**
   * List all render jobs for a project
   */
  async listRenderJobs(userId: string, projectId: string): Promise<RenderJob[]> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const jobsRef = collection(firestore, `users/${userId}/projects/${projectId}/renderJobs`);
      const snapshot = await getDocs(jobsRef);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        startedAt: doc.data().startedAt?.toDate?.() || null,
        completedAt: doc.data().completedAt?.toDate?.() || null,
      })) as RenderJob[];
    } catch (error) {
      console.error('Error listing render jobs:', error);
      return [];
    }
  }

  /**
   * List render jobs by status
   */
  async listRenderJobsByStatus(
    userId: string,
    projectId: string,
    status: RenderJobStatus
  ): Promise<RenderJob[]> {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);

    try {
      const jobsRef = collection(firestore, `users/${userId}/projects/${projectId}/renderJobs`);
      const q = query(jobsRef, where('status', '==', status));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        startedAt: doc.data().startedAt?.toDate?.() || null,
        completedAt: doc.data().completedAt?.toDate?.() || null,
      })) as RenderJob[];
    } catch (error) {
      console.error('Error listing render jobs by status:', error);
      return [];
    }
  }

  /**
   * Subscribe to render job updates
   */
  subscribeToRenderJob(
    userId: string,
    projectId: string,
    jobId: string,
    callback: (job: RenderJob) => void
  ): () => void {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);
    const docRef = doc(firestore, `users/${userId}/projects/${projectId}/renderJobs/${jobId}`);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const job = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
          startedAt: docSnap.data().startedAt?.toDate?.() || null,
          completedAt: docSnap.data().completedAt?.toDate?.() || null,
        } as RenderJob;
        callback(job);
      }
    });

    return unsubscribe;
  }

  /**
   * Subscribe to render jobs list
   */
  subscribeToRenderJobs(
    userId: string,
    projectId: string,
    callback: (jobs: RenderJob[]) => void
  ): () => void {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }

    const firestore = getFirestore(this.app);
    const jobsRef = collection(firestore, `users/${userId}/projects/${projectId}/renderJobs`);

    const unsubscribe = onSnapshot(jobsRef, (snapshot) => {
      const jobs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        startedAt: doc.data().startedAt?.toDate?.() || null,
        completedAt: doc.data().completedAt?.toDate?.() || null,
      })) as RenderJob[];
      callback(jobs);
    });

    return unsubscribe;
  }
}

export const renderQueueService = new RenderQueueService();
