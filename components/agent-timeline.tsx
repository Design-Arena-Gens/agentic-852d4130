import { CheckCircle2, Loader2, XCircle, Clock3 } from "lucide-react";
import type { AgentTimelineItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface Props {
  steps: AgentTimelineItem[];
}

const statusIcon = {
  idle: Clock3,
  running: Loader2,
  success: CheckCircle2,
  error: XCircle
};

const statusColors: Record<
  AgentTimelineItem["status"],
  { icon: string; bar: string }
> = {
  idle: { icon: "text-white/40", bar: "bg-white/10" },
  running: { icon: "text-brand-300", bar: "bg-brand-400" },
  success: { icon: "text-emerald-300", bar: "bg-emerald-500" },
  error: { icon: "text-rose-300", bar: "bg-rose-500" }
};

export function AgentTimeline({ steps }: Props) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-white/10" />
      <ul className="space-y-6">
        {steps.map((step, index) => {
          const Icon = statusIcon[step.status];
          const color = statusColors[step.status];
          return (
            <li key={step.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[23px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 ring-2 ring-white/10",
                  color.icon
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 animate-in fade-in",
                    step.status === "running" && "animate-spin"
                  )}
                />
              </span>
              <div className="glass-panel px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {index + 1}. {step.label}
                  </p>
                  <span className="text-xs uppercase tracking-wide text-white/50">
                    {step.status}
                  </span>
                </div>
                {step.detail && (
                  <p className="mt-2 text-sm text-white/80">{step.detail}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
                  {step.startedAt && <span>start: {step.startedAt}</span>}
                  {step.completedAt && <span>end: {step.completedAt}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
