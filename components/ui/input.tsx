import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseStyles =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(baseStyles, className)}
      {...props}
    />
  )
);

Input.displayName = "Input";
