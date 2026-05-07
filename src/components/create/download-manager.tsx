/**
 * Download Manager Component
 * Handles video downloads and sharing
 */

"use client";

import { useState } from "react";
import { Download, Share2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DownloadManagerProps {
  videoUrl: string | null;
  fileName?: string;
  isLoading?: boolean;
  onDownload?: () => void;
}

export function DownloadManager({
  videoUrl,
  fileName = "powermaker-video.mp4",
  isLoading = false,
  onDownload,
}: DownloadManagerProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = async () => {
    if (!videoUrl) return;

    try {
      setIsDownloading(true);
      onDownload?.();

      // Create download link
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `${fileName} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!videoUrl) return;

    navigator.clipboard.writeText(videoUrl);
    setIsCopied(true);

    toast({
      title: "Copied",
      description: "Video URL copied to clipboard",
    });

    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareSocial = (platform: string) => {
    if (!videoUrl) return;

    const encodedUrl = encodeURIComponent(videoUrl);
    const text = encodeURIComponent("Check out my music visualizer created with PowerMaker!");

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  if (!videoUrl) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Rendering video..." : "No video available for download"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Download & Share
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download MP4
            </>
          )}
        </Button>

        {/* Share Section */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <p className="text-sm font-medium">Share on Social Media</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareSocial("twitter")}
              className="gap-2"
            >
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareSocial("facebook")}
              className="gap-2"
            >
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareSocial("linkedin")}
              className="gap-2"
            >
              <span className="text-xs">LinkedIn</span>
            </Button>
          </div>
        </div>

        {/* Copy URL Section */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <p className="text-sm font-medium">Video URL</p>
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              readOnly
              className="text-xs bg-secondary/50 border-white/10"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopyUrl}
              className="shrink-0"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* File Info */}
        <div className="pt-4 border-t border-white/10 text-xs text-muted-foreground space-y-1">
          <p>📁 File: {fileName}</p>
          <p>📊 Format: MP4 (H.264)</p>
          <p>✨ Ready to download and share</p>
        </div>
      </CardContent>
    </Card>
  );
}
