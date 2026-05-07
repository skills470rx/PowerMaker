
export type VisualizerTemplate = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'edm' | 'chill' | 'anime' | 'neon';
  settings: {
    intensity: number;
    colorScheme: 'vibrant' | 'minimal' | 'retro' | 'custom';
    particleCount: number;
  };
};

export type RenderState = 'idle' | 'uploading' | 'analyzing' | 'rendering' | 'completed' | 'error';

export type UserAssets = {
  audio: File | null;
  image: File | null;
  audioName: string;
  imagePreview: string | null;
};
