import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, interactive, ...props }: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(31,27,20,.04),0_8px_24px_-16px_rgba(31,27,20,.18)]",
        interactive && "transition-transform duration-150 ease-calm active:scale-[0.98]",
        className,
      )}
      {...props}
    />
  );
}
