
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Sparkles, 
  MonitorPlay, 
  Download, 
  ArrowRight,
  Music4,
  Layers
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Video Creation
            </div>
            <h1 className="mb-6 font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              See Your Sound <br />
              <span className="text-primary">Come to Life</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Transform your music into professional visualizer videos. Upload your audio, choose a style, and let Rhythm Canvas handle the magic.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base font-bold bg-primary glow-primary hover:bg-primary/90">
                <Link href="/create">
                  Start Creating Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium border-primary/20 hover:bg-primary/5">
                <Link href="/templates">View Templates</Link>
              </Button>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-1/4 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
        </section>

        {/* Feature Grid */}
        <section className="bg-card/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-headline text-3xl font-bold md:text-4xl">Everything You Need to Visualize</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">Professional features simplified for creators, musicians, and producers.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<Music4 className="h-6 w-6 text-primary" />}
                title="Audio Reactive"
                description="Visuals that perfectly sync with every beat, bass drop, and melody of your track."
              />
              <FeatureCard 
                icon={<Layers className="h-6 w-6 text-accent" />}
                title="Custom Styles"
                description="Upload your own backgrounds, logos, and artwork to make the video uniquely yours."
              />
              <FeatureCard 
                icon={<Sparkles className="h-6 w-6 text-primary" />}
                title="AI Recommendation"
                description="Our AI analyzes your audio tempo and mood to suggest the best visualizer templates."
              />
              <FeatureCard 
                icon={<MonitorPlay className="h-6 w-6 text-accent" />}
                title="Real-time Preview"
                description="See changes instantly with our high-performance interactive preview engine."
              />
              <FeatureCard 
                icon={<Zap className="h-6 w-6 text-primary" />}
                title="Fast Rendering"
                description="Render high-quality MP4 videos in minutes, ready for YouTube, TikTok, and Instagram."
              />
              <FeatureCard 
                icon={<Download className="h-6 w-6 text-accent" />}
                title="4K Export Support"
                description="Export your creations in crystal clear quality with multiple aspect ratio options."
              />
            </div>
          </div>
        </section>

        {/* Template Showcase */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-end justify-between gap-4 mb-12 md:flex-row md:items-center">
              <div>
                <h2 className="font-headline text-3xl font-bold">Pro Templates</h2>
                <p className="text-muted-foreground">Start with a professionally designed foundation.</p>
              </div>
              <Button asChild variant="link" className="text-primary p-0 h-auto">
                <Link href="/templates">View all templates <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PlaceHolderImages.filter(img => img.id.startsWith('template-')).map((template, idx) => (
                <div key={idx} className="visualizer-card group rounded-xl">
                  <div className="aspect-video relative overflow-hidden">
                    <Image 
                      src={template.imageUrl} 
                      alt={template.description}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint={template.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                      <Button size="sm" className="bg-white text-black hover:bg-white/90">Preview Style</Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-headline font-bold mb-1 capitalize">{template.id.split('-')[1]} Style</h3>
                    <p className="text-xs text-muted-foreground">Perfect for high-energy electronic tracks.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border/40 bg-card/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Music4 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-headline font-bold">Rhythm Canvas</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rhythm Canvas. Empowering artists through visualization.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/20">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
        {icon}
      </div>
      <h3 className="mb-2 font-headline text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
