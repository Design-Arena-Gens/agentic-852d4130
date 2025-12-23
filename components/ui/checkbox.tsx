import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseStyles =
  "h-5 w-5 rounded-lg border border-white/30 bg-white/10 text-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(baseStyles, className)}
      {...props}
    />
  )
);

Checkbox.displayName = "Checkbox";
