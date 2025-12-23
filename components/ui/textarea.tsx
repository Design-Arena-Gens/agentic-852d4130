import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseStyles =
  "w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 resize-none";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseStyles, className)} {...props} />
  )
);

Textarea.displayName = "Textarea";
