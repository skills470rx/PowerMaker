/**
 * Enhanced Image Upload Component
 * Displays upload progress and image preview
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Image as ImageIcon, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MediaAssetMetadata } from "@/firebase/storage-service";

interface ImageUploadEnhancedProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  mediaAsset: MediaAssetMetadata | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  onClear: () => void;
}

export function ImageUploadEnhanced({
  onFileSelect,
  selectedFile,
  mediaAsset,
  isUploading,
  uploadProgress,
  error,
  onClear,
}: ImageUploadEnhancedProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

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
    return file.type.startsWith("image/");
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

  if (selectedFile && preview) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-6 animate-in fade-in zoom-in duration-300">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        
        {/* Image Preview */}
        <div className="mb-4 w-full max-w-[120px]">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg border border-primary/20 object-cover"
          />
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
    );
  }

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-accent/50 hover:bg-accent/5 min-h-[160px]",
        isDragging && "border-accent bg-accent/10"
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
        accept="image/*"
        onChange={handleInputChange}
      />
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground group-hover:text-accent transition-colors">
        <ImageIcon className="h-6 w-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Click or drag to upload image</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, GIF</p>
      </div>
    </div>
  );
}
