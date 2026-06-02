import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function SoftCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] border border-border/60",
        className,
      )}
      {...props}
    />
  );
}