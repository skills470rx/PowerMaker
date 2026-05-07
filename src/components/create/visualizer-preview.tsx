
"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VisualizerTemplate } from "@/lib/types";

interface VisualizerPreviewProps {
  audioFile: File | null;
  imageFile: File | null;
  template: VisualizerTemplate | null;
}

export function VisualizerPreview({ audioFile, imageFile, template }: VisualizerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  // Simulated visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background image if exists
      if (imagePreview) {
        // Here we'd normally draw the image, but for placeholder we'll just draw a tinted background
      }

      // Draw stylized bars based on selected template
      const bars = 60;
      const barWidth = canvas.width / bars;
      const intensity = isPlaying ? template?.settings.intensity || 1 : 0.1;
      
      ctx.fillStyle = isPlaying ? 'hsl(248, 100%, 65%)' : 'hsl(245, 10%, 40%)';
      
      for (let i = 0; i < bars; i++) {
        const h = isPlaying 
          ? (Math.sin(time + i * 0.2) + 1.2) * 50 * intensity + (Math.random() * 20)
          : 5;
        
        ctx.beginPath();
        if (template?.id === 'edm-circle') {
          // Draw circular visualization simplified
          const angle = (i / bars) * Math.PI * 2;
          const r = 80 + h;
          const x = canvas.width / 2 + Math.cos(angle) * r;
          const y = canvas.height / 2 + Math.sin(angle) * r;
          ctx.arc(x, y, 3, 0, Math.PI * 2);
        } else {
          // Default bars
          ctx.roundRect(i * barWidth, canvas.height - h, barWidth - 2, h, 2);
        }
        ctx.fill();
      }

      time += 0.05;
      if (isPlaying) {
        setProgress(p => (p + 0.1) % 100);
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, template, imagePreview]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/40 border border-white/5 shadow-2xl group">
        {/* Background Image Layer */}
        {imagePreview && (
          <div 
            className="absolute inset-0 opacity-40 blur-sm scale-105"
            style={{ backgroundImage: `url(${imagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        
        {/* Central visual element if image exists */}
        {imagePreview && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`h-40 w-40 rounded-full border-4 border-primary/50 overflow-hidden shadow-2xl transition-transform duration-300 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
              <img src={imagePreview} className="h-full w-full object-cover" alt="Custom background" />
            </div>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          width={800} 
          height={450} 
          className="relative z-10 h-full w-full"
        />

        {!audioFile && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <Sparkles className="h-12 w-12 text-primary mb-4 animate-pulse" />
            <p className="text-lg font-headline font-bold">Upload Audio to Preview</p>
            <p className="text-sm text-muted-foreground mt-1">Experience your track in full visual glory</p>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 z-30">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!audioFile}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>
            <div className="flex-1">
              <Slider 
                value={[progress]} 
                max={100} 
                step={0.1} 
                className="[&_.relative]:bg-white/20 [&_.absolute]:bg-primary"
              />
            </div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-mono">
              0:42 / 3:15
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              disabled={!audioFile}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
            {isPlaying ? 'Live Preview' : 'Idle'}
          </div>
          {template && (
            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              {template.name}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-3 w-3 mr-1.5" />
          Reset Preview
        </Button>
      </div>
    </div>
  );
}
