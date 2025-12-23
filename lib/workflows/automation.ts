import { Buffer } from "buffer";
import { nowIso } from "../utils";
import type { AgentConfig, AgentJobResult, AgentTimelineItem } from "../schemas";
import { draftVideoScript, storyboardFromScript } from "../services/openai";
import { generateVideoArtifact } from "../services/video-generator";
import { uploadToYoutube } from "../services/youtube";
import { uploadToTikTok } from "../services/tiktok";

interface ExecutionContext {
  steps: AgentTimelineItem[];
  result: AgentJobResult;
}

function createSteps(): AgentTimelineItem[] {
  return [
    {
      id: "script",
      label: "Generate Script",
      status: "idle"
    },
    {
      id: "storyboard",
      label: "Storyboard Builder",
      status: "idle"
    },
    {
      id: "render",
      label: "Render Video",
      status: "idle"
    },
    {
      id: "youtube",
      label: "Upload to YouTube",
      status: "idle"
    },
    {
      id: "tiktok",
      label: "Upload to TikTok",
      status: "idle"
    }
  ];
}

function cloneTimeline(steps: AgentTimelineItem[]): AgentTimelineItem[] {
  return steps.map((step) => ({ ...step }));
}

function markStep(
  ctx: ExecutionContext,
  id: string,
  patch: Partial<AgentTimelineItem>
) {
  const target = ctx.steps.find((step) => step.id === id);
  if (!target) return;
  Object.assign(target, patch);
}

export async function* executeAgentJob(
  config: AgentConfig
): AsyncGenerator<AgentJobResult, AgentJobResult> {
  const ctx: ExecutionContext = {
    steps: createSteps(),
    result: {
      steps: []
    }
  };

  const emit = (detail?: Partial<AgentJobResult>) => {
    ctx.result = {
      ...ctx.result,
      ...detail,
      steps: cloneTimeline(ctx.steps)
    };
    return ctx.result;
  };

  try {
    markStep(ctx, "script", { status: "running", startedAt: nowIso() });
    yield emit();
    const script = await draftVideoScript(config);
    markStep(ctx, "script", {
      status: "success",
      completedAt: nowIso(),
      detail: `${script.sections.length + 2} beats drafted`
    });

    markStep(ctx, "storyboard", { status: "running", startedAt: nowIso() });
    yield emit({
      output: {
        script: [script.hook, ...script.sections.map((s) => s.narration)].join(
          "\n\n"
        )
      }
    });
    const storyboard = storyboardFromScript(config, script);
    markStep(ctx, "storyboard", {
      status: "success",
      completedAt: nowIso(),
      detail: `${storyboard.scenes.length} scenes planned`
    });

    markStep(ctx, "render", {
      status: "running",
      startedAt: nowIso(),
      detail: "Generating video"
    });
    yield emit({
      output: {
        script: ctx.result.output?.script,
        storyboard
      }
    });
    const artifact = await generateVideoArtifact(storyboard, config);
    markStep(ctx, "render", {
      status: "success",
      completedAt: nowIso(),
      detail: artifact.filename
    });

    const base64 = Buffer.from(artifact.buffer).toString("base64");

    const uploadResults: AgentJobResult["output"] = {
      script: ctx.result.output?.script,
      storyboard,
      videoUrl: `data:${artifact.mimeType};base64,${base64}`
    };

    if (config.uploadTargets.includes("youtube")) {
      markStep(ctx, "youtube", { status: "running", startedAt: nowIso() });
      yield emit({ output: uploadResults });
      try {
        const youtube = await uploadToYoutube(
          artifact.buffer,
          config,
          storyboard.title,
          storyboard.description
        );
        markStep(ctx, "youtube", {
          status: "success",
          completedAt: nowIso(),
          detail: youtube.videoId
        });
        uploadResults.youtubeVideoId = youtube.videoId;
      } catch (error) {
        markStep(ctx, "youtube", {
          status: "error",
          completedAt: nowIso(),
          detail: error instanceof Error ? error.message : "Upload failed"
        });
      }
    }

    if (config.uploadTargets.includes("tiktok")) {
      markStep(ctx, "tiktok", { status: "running", startedAt: nowIso() });
      yield emit({ output: uploadResults });
      try {
        const tiktok = await uploadToTikTok(
          artifact.buffer,
          config,
          storyboard.title
        );
        markStep(ctx, "tiktok", {
          status: "success",
          completedAt: nowIso(),
          detail: tiktok.videoId
        });
        uploadResults.tiktokVideoId = tiktok.videoId;
      } catch (error) {
        markStep(ctx, "tiktok", {
          status: "error",
          completedAt: nowIso(),
          detail: error instanceof Error ? error.message : "Upload failed"
        });
      }
    }

    const finalResult = emit({ output: uploadResults });
    return finalResult;
  } catch (error) {
    const final = emit({
      error: error instanceof Error ? error.message : "Agent execution failed"
    });
    return final;
  }
}
