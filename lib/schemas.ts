import { z } from "zod";

export const UploadTargetSchema = z.enum(["youtube", "tiktok"]);

export const AgentConfigSchema = z.object({
  topic: z.string().min(4).max(240),
  tone: z.string().min(3).max(48),
  language: z.string().min(2).max(32),
  durationSeconds: z.number().min(30).max(600),
  callToAction: z.string().min(3).max(160),
  keywords: z.array(z.string().min(2).max(32)).max(10),
  includeBroll: z.boolean(),
  uploadTargets: z.array(UploadTargetSchema).min(1),
  scheduleTime: z.string().datetime().optional(),
  autoPublish: z.boolean()
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type UploadTarget = z.infer<typeof UploadTargetSchema>;

export type AgentStepStatus = "idle" | "running" | "success" | "error";

export interface AgentTimelineItem {
  id: string;
  label: string;
  status: AgentStepStatus;
  detail?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentJobResult {
  steps: AgentTimelineItem[];
  output?: {
    script?: string;
    storyboard?: Storyboard;
    videoUrl?: string;
    youtubeVideoId?: string;
    tiktokVideoId?: string;
  };
  error?: string;
}

export type Storyboard = {
  title: string;
  description: string;
  scenes: Array<{
    id: string;
    caption: string;
    narration: string;
    duration: number;
    visualStyle: string;
    brollDirection?: string;
  }>;
};
