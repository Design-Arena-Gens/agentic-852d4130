import OpenAI from "openai";
import { env } from "../env";
import type { AgentConfig, Storyboard } from "../schemas";

const client = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

function requireClient() {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return client;
}

export async function draftVideoScript(config: AgentConfig) {
  const openai = requireClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior short-form creative director. Return structured scripts that map perfectly into storyboard scenes."
      },
      {
        role: "user",
        content: [
          `Topic: ${config.topic}`,
          `Tone: ${config.tone}`,
          `Language: ${config.language}`,
          `Duration target: ${config.durationSeconds} seconds`,
          `Call to action: ${config.callToAction}`,
          `Keywords: ${config.keywords.join(", ")}`,
          `Include broll suggestions: ${config.includeBroll ? "yes" : "no"}`
        ].join("\n")
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI did not return script content");
  }

  const parsed = JSON.parse(content) as {
    title: string;
    hook: string;
    sections: Array<{
      heading: string;
      narration: string;
      duration_seconds: number;
      visuals?: string;
      broll?: string;
    }>;
    cta: string;
  };

  return parsed;
}

export function storyboardFromScript(
  config: AgentConfig,
  script: Awaited<ReturnType<typeof draftVideoScript>>
): Storyboard {
  const scenes = [
    {
      id: "hook",
      caption: script.hook,
      narration: script.hook,
      duration: Math.min(6, Math.max(3, Math.round(script.sections[0]?.duration_seconds ?? 4))),
      visualStyle: `Dynamic kinetic typography in ${config.tone} tone`,
      brollDirection: config.includeBroll ? script.sections[0]?.broll : undefined
    },
    ...script.sections.map((section, index) => ({
      id: `scene-${index + 1}`,
      caption: section.heading,
      narration: section.narration,
      duration: Math.min(
        20,
        Math.max(6, Math.round(section.duration_seconds))
      ),
      visualStyle: section.visuals || `Clean gradient background with bold captions (${config.tone})`,
      brollDirection: config.includeBroll ? section.broll : undefined
    })),
    {
      id: "cta",
      caption: config.callToAction,
      narration: script.cta,
      duration: 5,
      visualStyle: "Animated CTA card with strong typography",
      brollDirection: config.includeBroll ? "Brand CTA motion lockup" : undefined
    }
  ];

  return {
    title: script.title,
    description: `${script.hook}\n\n${script.sections
      .map((section) => section.heading)
      .join(" • ")}\n\n${script.cta}`,
    scenes
  };
}
