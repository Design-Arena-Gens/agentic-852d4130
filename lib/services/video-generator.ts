import { readFile } from "fs/promises";
import path from "path";
import { env } from "../env";
import type { AgentConfig, Storyboard } from "../schemas";

export interface VideoArtifact {
  buffer: Uint8Array;
  mimeType: string;
  filename: string;
}

interface ExternalVideoJob {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  error?: string;
}

async function requestExternalVideoJob(
  storyboard: Storyboard,
  config: AgentConfig
): Promise<VideoArtifact> {
  if (!env.VIDEO_GEN_API_URL || !env.VIDEO_GEN_API_KEY) {
    throw new Error("External video generation not configured");
  }

  const jobResponse = await fetch(env.VIDEO_GEN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.VIDEO_GEN_API_KEY}`
    },
    body: JSON.stringify({
      storyboard,
      metadata: {
        duration: storyboard.scenes.reduce((acc, scene) => acc + scene.duration, 0),
        language: config.language,
        tone: config.tone
      }
    })
  });

  if (!jobResponse.ok) {
    throw new Error(`Video generation request failed: ${jobResponse.statusText}`);
  }

  const job: ExternalVideoJob = await jobResponse.json();

  if (!job.id) {
    throw new Error("Video generation provider did not return a job id");
  }

  let status: ExternalVideoJob = job;
  const timeoutAt = Date.now() + 15 * 60 * 1000;

  while (Date.now() < timeoutAt) {
    if (status.status === "completed" && status.downloadUrl) {
      const download = await fetch(status.downloadUrl, {
        headers: {
          Authorization: `Bearer ${env.VIDEO_GEN_API_KEY}`
        }
      });
      if (!download.ok) {
        throw new Error("Failed to download generated video");
      }
      const arrayBuffer = await download.arrayBuffer();
      return {
        buffer: new Uint8Array(arrayBuffer),
        mimeType: download.headers.get("content-type") ?? "video/mp4",
        filename: `agentic-video-${Date.now()}.mp4`
      };
    }

    if (status.status === "failed") {
      throw new Error(status.error ?? "Video generation failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const pollResponse = await fetch(`${env.VIDEO_GEN_API_URL}/${job.id}`, {
      headers: {
        Authorization: `Bearer ${env.VIDEO_GEN_API_KEY}`
      }
    });

    if (!pollResponse.ok) {
      throw new Error("Failed to poll video generation job");
    }

    status = await pollResponse.json();
  }

  throw new Error("Video generation timed out");
}

async function fallbackVideo(): Promise<VideoArtifact> {
  const fallbackPath = path.join(process.cwd(), "public", "placeholder.mp4");
  const file = await readFile(fallbackPath);
  return {
    buffer: new Uint8Array(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)),
    mimeType: "video/mp4",
    filename: `placeholder-${Date.now()}.mp4`
  };
}

export async function generateVideoArtifact(
  storyboard: Storyboard,
  config: AgentConfig
): Promise<VideoArtifact> {
  try {
    if (env.VIDEO_GEN_API_URL && env.VIDEO_GEN_API_KEY) {
      return await requestExternalVideoJob(storyboard, config);
    }
  } catch (error) {
    console.error("External video generation failed, using fallback:", error);
  }

  return fallbackVideo();
}
