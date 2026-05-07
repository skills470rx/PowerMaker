/**
 * Enhanced Audio Upload Component
 * Displays upload progress, analysis results, and audio metrics
 */

"use client";

import { useRef, useState } from "react";
import { Upload, Music, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { AudioAnalysisResult } from "@/lib/audio-analyzer";

interface AudioUploadEnhancedProps {
  onFileSelect: (file: File) => void;
  onAnalysisComplete?: (analysis: AudioAnalysisResult) => void;
  selectedFile: File | null;
  analysisResult: AudioAnalysisResult | null;
  isAnalyzing: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  onClear: () => void;
}

export function AudioUploadEnhanced({
  onFileSelect,
  onAnalysisComplete,
  selectedFile,
  analysisResult,
  isAnalyzing,
  isUploading,
  uploadProgress,
  error,
  onClear,
}: AudioUploadEnhancedProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const isValidFile = (file: File) => {
    return file.type.startsWith("audio/");
  };

  if (error) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6 animate-in fade-in zoom-in duration-300">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Upload Error</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-6 animate-in fade-in zoom-in duration-300">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div className="text-center w-full">
          <p className="text-sm font-medium text-foreground">Uploading...</p>
          <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
          <Progress value={uploadProgress} className="mt-3" />
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-6 animate-in fade-in zoom-in duration-300">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Analyzing Audio...</p>
          <p className="text-xs text-muted-foreground mt-1">Detecting beats, volume, and frequency</p>
        </div>
      </div>
    );
  }

  if (selectedFile && analysisResult) {
    return (
      <div className="space-y-4">
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-6 animate-in fade-in zoom-in duration-300">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Analysis Results */}
        <Card className="bg-card/50 backdrop-blur-sm border-white/5 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">BPM</p>
              <p className="text-lg font-bold text-primary">{analysisResult.bpm}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Duration</p>
              <p className="text-lg font-bold text-primary">{formatDuration(analysisResult.duration)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Average Volume</p>
              <p className="text-lg font-bold text-accent">{analysisResult.averageVolume}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Peak Volume</p>
              <p className="text-lg font-bold text-accent">{analysisResult.peakVolume}%</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-muted-foreground font-medium">Detected Genre</p>
              <p className="text-sm font-semibold text-foreground capitalize bg-secondary/50 rounded px-2 py-1 inline-block">
                {analysisResult.genre}
              </p>
            </div>
          </div>

          {/* Energy Profile Visualization */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground font-medium mb-3">Energy Profile</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8">Low</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{
                      width: `${Math.min(100, (analysisResult.energyProfile.low[0] || 0) / 10)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8">Mid</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                    style={{
                      width: `${Math.min(100, (analysisResult.energyProfile.mid[0] || 0) / 10)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8">High</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                    style={{
                      width: `${Math.min(100, (analysisResult.energyProfile.high[0] || 0) / 10)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Beat Information */}
          {analysisResult.beats.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground font-medium mb-2">
                Detected Beats: {analysisResult.beats.length}
              </p>
              <div className="flex flex-wrap gap-1">
                {analysisResult.beats.slice(0, 10).map((beat, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-xs px-2 py-1 rounded",
                      beat.frequency === "high"
                        ? "bg-red-500/20 text-red-300"
                        : beat.frequency === "mid"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-blue-500/20 text-blue-300"
                    )}
                  >
                    {beat.time.toFixed(1)}s
                  </span>
                ))}
                {analysisResult.beats.length > 10 && (
                  <span className="text-xs px-2 py-1 text-muted-foreground">
                    +{analysisResult.beats.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/50 hover:bg-primary/5 min-h-[160px]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="audio/*"
        onChange={handleInputChange}
      />
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
        <Music className="h-6 w-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Click or drag to upload audio</p>
        <p className="text-xs text-muted-foreground mt-1">MP3, WAV, FLAC, M4A</p>
      </div>
    </div>
  );
}

/**
 * Format duration in seconds to MM:SS format
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
