
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  CheckCircle2, 
  ArrowLeft,
  Youtube,
  Instagram,
  Twitter,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ExportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary glow-primary/20">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          <h1 className="mb-4 font-headline text-4xl font-bold md:text-5xl">Your Masterpiece is Ready!</h1>
          <p className="mb-10 text-lg text-muted-foreground">
            The visualization for your track has been successfully rendered and is ready for the world to see.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50 border-white/5 overflow-hidden">
              <div className="aspect-video relative bg-black/40 flex items-center justify-center">
                <div className="text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded bg-primary/20 animate-pulse" />
                  Video Preview Loading...
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-primary hover:bg-primary/90 glow-primary h-12 text-base font-bold">
                    <Download className="mr-2 h-5 w-5" />
                    Download MP4 (1080p)
                  </Button>
                  <Button variant="outline" className="w-full h-11 border-primary/20 hover:bg-primary/5">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <div className="text-left space-y-4">
                <h3 className="font-headline text-xl font-bold">Share to Platforms</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="secondary" className="justify-start h-11 bg-white/5 hover:bg-white/10 text-foreground">
                    <Youtube className="mr-3 h-5 w-5 text-red-500" />
                    Post to YouTube
                  </Button>
                  <Button variant="secondary" className="justify-start h-11 bg-white/5 hover:bg-white/10 text-foreground">
                    <Instagram className="mr-3 h-5 w-5 text-pink-500" />
                    Post to Instagram
                  </Button>
                  <Button variant="secondary" className="justify-start h-11 bg-white/5 hover:bg-white/10 text-foreground">
                    <Twitter className="mr-3 h-5 w-5 text-blue-400" />
                    Share on X (Twitter)
                  </Button>
                </div>
              </div>

              <div className="text-left p-6 rounded-2xl bg-primary/5 border border-primary/20">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Creator Tip
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Videos with high visual intensity perform 40% better on TikTok and Shorts. 
                  Try our "Neon Wave" template for your next upbeat track!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-center gap-4">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/create">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Editor
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button asChild variant="link" className="text-primary p-0">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
