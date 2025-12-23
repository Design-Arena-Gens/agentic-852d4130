import { AgentConfigSchema } from "@/lib/schemas";
import { executeAgentJob } from "@/lib/workflows/automation";
import { NextResponse } from "next/server";

function parseKeywords(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item)).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = AgentConfigSchema.parse({
      topic: String(body.topic ?? "").trim(),
      tone: String(body.tone ?? "").trim(),
      language: String(body.language ?? "").trim(),
      durationSeconds: Number(body.durationSeconds ?? 90),
      callToAction: String(body.callToAction ?? "").trim(),
      keywords: parseKeywords(body.keywords),
      includeBroll: Boolean(body.includeBroll),
      uploadTargets: Array.isArray(body.uploadTargets)
        ? body.uploadTargets
        : [body.uploadTargets].filter(Boolean),
      scheduleTime: body.scheduleTime || undefined,
      autoPublish: Boolean(body.autoPublish)
    });

    let latest;
    for await (const state of executeAgentJob(config)) {
      latest = state;
    }

    if (!latest) {
      throw new Error("Agent did not produce a result");
    }

    return NextResponse.json(latest);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error"
      },
      { status: 500 }
    );
  }
}
