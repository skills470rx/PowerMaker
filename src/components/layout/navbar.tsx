
"use client";

import Link from "next/link";
import { Music2, Play, LayoutTemplate, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary glow-primary">
            <Music2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">Rhythm Canvas</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Link>
          <Link href="/create" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <Play className="h-4 w-4" />
            Create
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 glow-primary font-medium">
            <Link href="/create">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
