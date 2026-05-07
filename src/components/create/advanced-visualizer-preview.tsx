/**
 * Advanced Visualizer Preview Component
 * Real-time canvas rendering with template support
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TemplateConfiguration } from "@/lib/template-runtime";
import { AudioAnalysisResult } from "@/lib/audio-analyzer";
import { useCanvasPreview } from "@/hooks/use-canvas-preview";
import { cn } from "@/lib/utils";

interface AdvancedVisualizerPreviewProps {
  audioFile: File | null;
  imageFile: File | null;
  template: TemplateConfiguration | null;
  analysisResult: AudioAnalysisResult | null;
  onSettingsClick?: () => void;
}

export function AdvancedVisualizerPreview({
  audioFile,
  imageFile,
  template,
  analysisResult,
  onSettingsClick,
}: AdvancedVisualizerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const { isRendering, frameNumber, fps, error, resetPreview, captureFrame } = useCanvasPreview(
    canvasRef as React.RefObject<HTMLCanvasElement>,
    audioFile,
    imageFile,
    template,
    analysisResult,
    isPlaying
  );

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, []);

  // Setup audio playback
  useEffect(() => {
    if (!audioFile || !audioRef.current) return;

    const url = URL.createObjectURL(audioFile);
    audioRef.current.src = url;

    const handleLoadedMetadata = () => {
      setDuration(audioRef.current?.duration || 0);
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("ended", handleEnded);

    return () => {
      audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current?.removeEventListener("ended", handleEnded);
      URL.revokeObjectURL(url);
    };
  }, [audioFile]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => console.error("Play error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!audioFile) return;
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(value[0]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    resetPreview();
  };

  const handleDownloadFrame = () => {
    const frameData = captureFrame();
    if (!frameData) return;

    const link = document.createElement("a");
    link.href = frameData;
    link.download = `frame-${Date.now()}.png`;
    link.click();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/40 border border-white/5 shadow-2xl group">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full",
            !isRendering && "bg-gradient-to-br from-slate-900 to-slate-950"
          )}
        />

        {/* Empty State */}
        {!audioFile && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <Sparkles className="h-12 w-12 text-primary mb-4 animate-pulse" />
            <p className="text-lg font-headline font-bold">Upload Audio to Preview</p>
            <p className="text-sm text-muted-foreground mt-1">Experience your track in full visual glory</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20 backdrop-blur-sm z-20">
            <p className="text-lg font-headline font-bold text-destructive">Render Error</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 z-30">
          <div className="flex flex-col gap-3">
            {/* Progress Bar */}
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="[&_.relative]:bg-white/20 [&_.absolute]:bg-primary"
            />

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={handlePlayPause}
                disabled={!audioFile}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </Button>

              <div className="flex-1" />

              <div className="flex items-center gap-2 text-white/80 text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setVolume(Math.max(0, volume - 10))}
              >
                <Volume2 className="h-4 w-4" />
              </Button>

              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(v) => setVolume(v[0])}
                className="w-20 [&_.relative]:bg-white/20 [&_.absolute]:bg-primary"
              />

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={handleDownloadFrame}
                title="Download frame"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={onSettingsClick}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg z-20">
          <div className={cn("h-2 w-2 rounded-full", isRendering ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
          <span className="text-xs font-mono text-white/80">
            {isRendering ? `${fps} FPS` : "Idle"}
          </span>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <div className={cn("h-2 w-2 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
            {isPlaying ? "Live Preview" : "Idle"}
          </div>
          {template && (
            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              {template.name}
            </span>
          )}
          {isRendering && (
            <span className="text-xs font-mono text-accent">
              Frame: {frameNumber}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="h-3 w-3 mr-1.5" />
          Reset Preview
        </Button>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );
}
