
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, Star, Clock, Filter } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const CATEGORIES = ["All", "EDM", "Chill", "Anime", "Neon", "Retro", "Minimalist"];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const templateImages = PlaceHolderImages.filter(img => img.id.startsWith('template-'));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-headline text-4xl font-bold tracking-tight md:text-5xl">Explore Styles</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Browse our library of professionally crafted visualizer templates for every genre and mood.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "secondary"}
                onClick={() => setActiveCategory(cat)}
                className={`h-9 rounded-full px-5 text-sm font-medium ${
                  activeCategory === cat ? "bg-primary glow-primary" : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search styles..." 
              className="pl-10 h-10 bg-secondary/50 border-white/5 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...templateImages, ...templateImages].map((template, idx) => (
            <div key={idx} className="visualizer-card group rounded-2xl">
              <div className="aspect-[4/3] relative overflow-hidden rounded-t-2xl">
                <Image 
                  src={template.imageUrl} 
                  alt={template.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={template.imageHint}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <div className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-wider">
                    {template.id.split('-')[1]}
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-3">
                  <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90">
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-headline font-bold text-lg capitalize">{template.id.split('-')[1]} Motion</h3>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-bold">4.9</span>
                  </div>
                </div>
                <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                  High-fidelity reactive visualization with custom particle effects and dynamic color grading.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>~3m render</span>
                  </div>
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                    <Link href={`/create?template=${template.id}`}>Use Style</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
