/**
 * Render Queue Component
 * Displays rendering jobs and their progress
 */

"use client";

import { useState, useEffect } from "react";
import { Play, Pause, X, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RenderJob } from "@/firebase/render-queue-service";
import { cn } from "@/lib/utils";

interface RenderQueueProps {
  jobs: RenderJob[];
  onDownload?: (job: RenderJob) => void;
  onCancel?: (jobId: string) => void;
}

export function RenderQueue({ jobs, onDownload, onCancel }: RenderQueueProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  if (jobs.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No render jobs yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Render Queue
          <Badge variant="secondary" className="ml-auto">
            {jobs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <RenderJobItem
            key={job.id}
            job={job}
            isExpanded={expandedJobId === job.id}
            onToggleExpand={() =>
              setExpandedJobId(expandedJobId === job.id ? null : job.id)
            }
            onDownload={() => onDownload?.(job)}
            onCancel={() => onCancel?.(job.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface RenderJobItemProps {
  job: RenderJob;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDownload: () => void;
  onCancel: () => void;
}

function RenderJobItem({
  job,
  isExpanded,
  onToggleExpand,
  onDownload,
  onCancel,
}: RenderJobItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300";
      case "processing":
      case "encoding":
        return "bg-blue-500/20 text-blue-300";
      case "queued":
        return "bg-yellow-500/20 text-yellow-300";
      case "failed":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "processing":
      case "encoding":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Pause className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const duration =
    job.completedAt && job.startedAt
      ? new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
      : 0;

  return (
    <div className="border border-white/5 rounded-lg p-4 space-y-3 hover:bg-white/5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn("p-2 rounded-lg", getStatusColor(job.status))}>
            {getStatusIcon(job.status)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              Project: {job.projectId}
            </p>
            <p className="text-xs text-muted-foreground">
              {job.config.quality} • {job.config.resolution} • {job.config.fps}fps
            </p>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {job.status}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleExpand}
        >
          {isExpanded ? "−" : "+"}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-mono text-primary">
            {job.progressPercentage}%
          </span>
        </div>
        <Progress value={job.progressPercentage} className="h-2" />
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="pt-3 border-t border-white/5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-mono">{formatTime(job.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Started</p>
              <p className="font-mono">{formatTime(job.startedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="font-mono">{formatTime(job.completedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-mono">{duration > 0 ? formatDuration(duration) : "N/A"}</p>
            </div>
          </div>

          {/* Config Details */}
          <div className="bg-black/20 rounded p-2">
            <p className="text-muted-foreground mb-1">Configuration</p>
            <div className="space-y-1 text-muted-foreground">
              <p>• Template: {job.config.templateId}</p>
              <p>• Audio: {job.config.audioAssetId}</p>
              <p>• Images: {job.config.imageAssetIds.length}</p>
            </div>
          </div>

          {/* Error Message */}
          {job.errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
              <p className="text-red-300 text-xs">{job.errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {job.status === "completed" && job.outputVideoUrl && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                onClick={onDownload}
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            )}
            {(job.status === "queued" || job.status === "processing") && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 text-destructive hover:text-destructive"
                onClick={onCancel}
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
