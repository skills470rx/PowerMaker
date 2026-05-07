
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { UploadZone } from "@/components/create/upload-zone";
import { VisualizerPreview } from "@/components/create/visualizer-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, 
  Wand2, 
  Settings2, 
  Video, 
  Music, 
  Image as ImageIcon,
  Loader2,
  Check
} from "lucide-react";
import { VisualizerTemplate, RenderState } from "@/lib/types";
import { recommendVisualizerStyles } from "@/ai/flows/ai-recommends-visualizer-styles";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_TEMPLATES: VisualizerTemplate[] = [
  { id: 'edm-circle', name: 'EDM Circle', description: 'Energetic geometric pulses', category: 'edm', thumbnail: '/api/placeholder/100/100', settings: { intensity: 1, colorScheme: 'vibrant', particleCount: 50 } },
  { id: 'chill-player', name: 'Chill Wave', description: 'Smooth ambient lines', category: 'chill', thumbnail: '/api/placeholder/100/100', settings: { intensity: 0.6, colorScheme: 'minimal', particleCount: 20 } },
  { id: 'anime-style', name: 'Digital Anime', description: 'Expressive aesthetic visuals', category: 'anime', thumbnail: '/api/placeholder/100/100', settings: { intensity: 0.8, colorScheme: 'vibrant', particleCount: 80 } },
  { id: 'neon-wave', name: 'Cyber Neon', description: 'Retro glowing waveforms', category: 'neon', thumbnail: '/api/placeholder/100/100', settings: { intensity: 1.2, colorScheme: 'retro', particleCount: 100 } },
];

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VisualizerTemplate>(DEFAULT_TEMPLATES[0]);
  const [renderState, setRenderState] = useState<RenderState>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<{templateName: string, reason: string}[] | null>(null);
  const [customSettings, setCustomSettings] = useState(selectedTemplate.settings);

  const handleAiRecommend = async () => {
    if (!audioFile) {
      toast({
        title: "Audio required",
        description: "Please upload an audio file first so AI can analyze it.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // In a real app we'd extract tempo/mood from audioFile. 
      // For scaffolded version, we simulate the analysis input.
      const result = await recommendVisualizerStyles({
        audioCharacteristics: `File: ${audioFile.name}, Type: ${audioFile.type}, Size: ${(audioFile.size / 1024 / 1024).toFixed(1)}MB. Simulated: tempo: 128bpm, mood: energetic, genre: electronic.`,
        preferredTemplates: DEFAULT_TEMPLATES.map(t => t.name)
      });
      setAiRecommendations(result.recommendations);
      
      // Auto-select first recommendation if it matches a template ID partially
      const matched = DEFAULT_TEMPLATES.find(t => 
        result.recommendations[0].templateName.toLowerCase().includes(t.id.split('-')[0])
      );
      if (matched) setSelectedTemplate(matched);
      
      toast({
        title: "AI Analysis Complete",
        description: `Recommended: ${result.recommendations[0].templateName}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Error",
        description: "Failed to get AI recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRender = () => {
    if (!audioFile) return;
    setRenderState('rendering');
    
    // Simulate rendering process
    setTimeout(() => {
      setRenderState('completed');
      router.push(`/export/success?template=${selectedTemplate.id}`);
    }, 3000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Create Visualizer</h1>
            <p className="text-muted-foreground">Upload assets and customize your visual experience.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleAiRecommend}
              disabled={isAnalyzing || !audioFile}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-all glow-primary/20"
            >
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4 text-primary" />}
              AI Recommend
            </Button>
            <Button
              onClick={handleRender}
              disabled={!audioFile || renderState === 'rendering'}
              className="bg-primary hover:bg-primary/90 glow-primary min-w-[140px]"
            >
              {renderState === 'rendering' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Render Video
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Asset Uploads & Preview */}
          <div className="space-y-6 lg:col-span-8">
            <VisualizerPreview 
              audioFile={audioFile} 
              imageFile={imageFile} 
              template={selectedTemplate} 
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Music className="h-5 w-5 text-primary" />
                    Audio Track
                  </CardTitle>
                  <CardDescription>Upload the music you want to visualize.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadZone 
                    type="audio" 
                    onFileSelect={setAudioFile} 
                    selectedFile={audioFile} 
                    onClear={() => setAudioFile(null)} 
                  />
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="h-5 w-5 text-accent" />
                    Custom Visuals
                  </CardTitle>
                  <CardDescription>Optional: Add a background image or logo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadZone 
                    type="image" 
                    onFileSelect={setImageFile} 
                    selectedFile={imageFile} 
                    onClear={() => setImageFile(null)} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Customization & Templates */}
          <div className="space-y-6 lg:col-span-4">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1">
                <TabsTrigger value="templates" className="data-[state=active]:bg-background">Styles</TabsTrigger>
                <TabsTrigger value="customize" className="data-[state=active]:bg-background">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="mt-4 space-y-4">
                <div className="grid gap-4">
                  {DEFAULT_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all text-left ${
                        selectedTemplate.id === t.id 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-white/5 bg-card/40 hover:bg-card/80'
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Sparkles className={`h-6 w-6 ${selectedTemplate.id === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-bold text-sm">{t.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      {selectedTemplate.id === t.id && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>

                {aiRecommendations && (
                  <div className="mt-8 rounded-xl bg-primary/5 border border-primary/20 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h4 className="flex items-center gap-2 font-headline text-sm font-bold text-primary mb-3">
                      <Sparkles className="h-4 w-4" />
                      AI Analysis Recommendations
                    </h4>
                    <div className="space-y-3">
                      {aiRecommendations.map((rec, i) => (
                        <div key={i} className="text-xs leading-relaxed">
                          <span className="font-bold text-foreground">{rec.templateName}:</span>
                          <span className="text-muted-foreground ml-1">{rec.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="customize" className="mt-4 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Visual Intensity</Label>
                      <span className="text-xs font-mono text-primary">{(customSettings.intensity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider 
                      value={[customSettings.intensity * 100]} 
                      onValueChange={(v) => setCustomSettings({...customSettings, intensity: v[0] / 100})}
                      max={200} 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Complexity</Label>
                      <span className="text-xs font-mono text-primary">{customSettings.particleCount} particles</span>
                    </div>
                    <Slider 
                      value={[customSettings.particleCount]} 
                      onValueChange={(v) => setCustomSettings({...customSettings, particleCount: v[0]})}
                      max={200} 
                      min={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Render Quality</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['720p', '1080p', '4K'].map((q) => (
                        <Button 
                          key={q} 
                          variant={q === '1080p' ? 'default' : 'outline'} 
                          size="sm" 
                          className={`text-[10px] h-8 ${q === '1080p' ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30' : 'border-white/5'}`}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Output Format</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-[10px] h-8 border-primary/30 bg-primary/10 text-primary">MP4 (Video)</Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-8 border-white/5">GIF (Preview)</Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-white/10 p-4 bg-secondary/20">
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    Higher quality settings may increase rendering time. Your video will be stored in your library for 7 days.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
