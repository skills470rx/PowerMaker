
"use client";

import { useRef, useState } from "react";
import { Upload, Music, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  type: "audio" | "image";
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function UploadZone({ type, onFileSelect, selectedFile, onClear }: UploadZoneProps) {
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
    if (type === "audio") return file.type.startsWith("audio/");
    if (type === "image") return file.type.startsWith("image/");
    return false;
  };

  if (selectedFile) {
    return (
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
    );
  }

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/50 hover:bg-primary/5",
        isDragging && "border-primary bg-primary/10",
        type === "audio" ? "min-h-[160px]" : "min-h-[160px]"
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
        accept={type === "audio" ? "audio/*" : "image/*"}
        onChange={handleInputChange}
      />
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
        {type === "audio" ? <Music className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Click or drag to upload {type}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {type === "audio" ? "MP3, WAV, FLAC" : "PNG, JPG, WebP"}
        </p>
      </div>
    </div>
  );
}
