/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Library,
  BrainCircuit,
  Settings,
  Laptop2,
  Youtube,
  Clapperboard,
  Timer,
  Loader2,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AgentTimeline } from "@/components/agent-timeline";
import type { AgentJobResult, AgentTimelineItem } from "@/lib/schemas";
import { formatDuration } from "@/lib/utils";

interface FormState {
  topic: string;
  tone: string;
  language: string;
  durationSeconds: number;
  callToAction: string;
  keywords: string;
  includeBroll: boolean;
  uploadTargets: {
    youtube: boolean;
    tiktok: boolean;
  };
  autoPublish: boolean;
  scheduleTime?: string;
}

const initialForm: FormState = {
  topic: "AI tips to grow your business",
  tone: "Energetic",
  language: "English",
  durationSeconds: 75,
  callToAction: "Follow for more daily growth hacks!",
  keywords: "AI,automation,businessgrowth",
  includeBroll: true,
  uploadTargets: {
    youtube: true,
    tiktok: true
  },
  autoPublish: true,
  scheduleTime: undefined
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<AgentJobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inFlight = isSubmitting || isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const payload = {
      ...form,
      keywords: form.keywords.split(",").map((item) => item.trim()),
      uploadTargets: Object.entries(form.uploadTargets)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key),
      includeBroll: form.includeBroll,
      autoPublish: form.autoPublish,
      scheduleTime: form.scheduleTime || undefined
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to run agent");
        }

        const data: AgentJobResult = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const steps: AgentTimelineItem[] =
    result?.steps ??
    [
      { id: "script", label: "Generate Script", status: "idle" },
      { id: "storyboard", label: "Storyboard Builder", status: "idle" },
      { id: "render", label: "Render Video", status: "idle" },
      { id: "youtube", label: "Upload to YouTube", status: "idle" },
      { id: "tiktok", label: "Upload to TikTok", status: "idle" }
    ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 p-6 md:p-10">
      <header className="glass-panel flex flex-col gap-6 px-8 py-10">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200/80">
            <BrainCircuit className="h-4 w-4" />
            Agentic Creator
          </span>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Auto-generate & publish short-form videos
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            Design your content strategy once, and let the agent write, render,
            and deliver videos straight to TikTok and YouTube with one click.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-white/60 sm:grid-cols-3">
          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <Library className="h-10 w-10 rounded-2xl bg-brand-500/20 p-2 text-brand-200" />
            <div>
              <p className="font-semibold text-white">Scripted scenes</p>
              <p>LLM-crafted hooks & beats</p>
            </div>
          </div>
          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <Settings className="h-10 w-10 rounded-2xl bg-emerald-500/20 p-2 text-emerald-200" />
            <div>
              <p className="font-semibold text-white">Autonomous render</p>
              <p>Video compiled for you</p>
            </div>
          </div>
          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <Laptop2 className="h-10 w-10 rounded-2xl bg-purple-500/20 p-2 text-purple-200" />
            <div>
              <p className="font-semibold text-white">Direct publishing</p>
              <p>Uploads to TikTok & YouTube</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.form
          layout
          onSubmit={handleSubmit}
          className="glass-panel flex flex-col gap-6 px-8 py-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Production brief
            </h2>
            <span className="text-xs uppercase tracking-widest text-white/60">
              Agent Input
            </span>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Topic</span>
            <Input
              value={form.topic}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, topic: event.target.value }))
              }
              placeholder="e.g. 3 hidden AI automations to grow your agency"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Tone</span>
              <Input
                value={form.tone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tone: event.target.value }))
                }
                placeholder="Energetic, witty, cinematic..."
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Language</span>
              <Input
                value={form.language}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, language: event.target.value }))
                }
                placeholder="English, فارسی, العربية..."
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              <Timer className="h-4 w-4 text-brand-200" />
              Desired runtime ({formatDuration(form.durationSeconds)})
            </span>
            <input
              type="range"
              min={30}
              max={300}
              value={form.durationSeconds}
              className="w-full accent-brand-400"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  durationSeconds: Number(event.target.value)
                }))
              }
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Call to action</span>
            <Textarea
              value={form.callToAction}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  callToAction: event.target.value
                }))
              }
              placeholder="Tell viewers what to do next"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-white">
              Hashtags & keywords
            </span>
            <Input
              value={form.keywords}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, keywords: event.target.value }))
              }
              placeholder="Separate with commas"
            />
            <p className="text-xs text-white/50">
              Used for script emphasis and platform metadata.
            </p>
          </label>

          <div className="grid gap-4 rounded-2xl bg-white/5 p-5 sm:grid-cols-2">
            <label className="flex items-start gap-3">
              <Checkbox
                checked={form.includeBroll}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    includeBroll: event.target.checked
                  }))
                }
              />
              <div>
                <p className="text-sm font-semibold text-white">B-roll prompts</p>
                <p className="text-sm text-white/60">
                  Include scene-level suggestions for stock or generated B-roll.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3">
              <Checkbox
                checked={form.autoPublish}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    autoPublish: event.target.checked
                  }))
                }
              />
              <div>
                <p className="text-sm font-semibold text-white">Auto publish</p>
                <p className="text-sm text-white/60">
                  When disabled, drafts remain private for manual review.
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-3 rounded-2xl bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">Upload targets</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={form.uploadTargets.youtube}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      uploadTargets: {
                        ...prev.uploadTargets,
                        youtube: event.target.checked
                      }
                    }))
                  }
                />
                <span className="flex items-center gap-2 text-sm text-white">
                  <Youtube className="h-4 w-4 text-red-400" />
                  YouTube Shorts
                </span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={form.uploadTargets.tiktok}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      uploadTargets: {
                        ...prev.uploadTargets,
                        tiktok: event.target.checked
                      }
                    }))
                  }
                />
                <span className="flex items-center gap-2 text-sm text-white">
                  <Clapperboard className="h-4 w-4 text-fuchsia-300" />
                  TikTok
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">
                Schedule (optional)
              </span>
              <Input
                type="datetime-local"
                value={form.scheduleTime ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    scheduleTime: event.target.value || undefined
                  }))
                }
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={inFlight}
              className="h-12 rounded-2xl text-base"
            >
              {inFlight ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running agent...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Generate & publish
                </>
              )}
            </Button>
            <p className="text-xs text-white/50">
              Requires configured API keys for OpenAI, video rendering provider,
              TikTok Content Posting API, and YouTube Data API.
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}
        </motion.form>

        <aside className="glass-panel flex flex-col gap-6 px-7 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Production monitor
            </h2>
            <span className="text-xs uppercase tracking-widest text-white/60">
              Agent Output
            </span>
          </div>

          <AgentTimeline steps={steps} />

          {result?.output?.videoUrl && (
            <div className="space-y-3 rounded-2xl bg-white/5 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Clapperboard className="h-4 w-4 text-brand-200" />
                Preview
              </p>
              <video
                className="w-full overflow-hidden rounded-xl border border-white/10"
                src={result.output.videoUrl}
                controls
                playsInline
              />
            </div>
          )}

          {result?.output?.script && (
            <div className="space-y-3 rounded-2xl bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Narration</p>
              <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-white/70">
                {result.output.script}
              </pre>
            </div>
          )}

          <div className="space-y-2 text-sm text-white/70">
            {result?.output?.youtubeVideoId && (
              <p className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-400" />
                YouTube video ID:{" "}
                <a
                  href={`https://youtu.be/${result.output.youtubeVideoId}`}
                  className="text-brand-300 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {result.output.youtubeVideoId}
                </a>
              </p>
            )}
            {result?.output?.tiktokVideoId && (
              <p className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-fuchsia-300" />
                TikTok video ID: {result.output.tiktokVideoId}
              </p>
            )}
          </div>

          {result?.error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {result.error}
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
