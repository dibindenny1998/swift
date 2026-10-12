import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Input({
  label,
  hint,
  error,
  prefix,
  className,
  id,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string; error?: string; prefix?: ReactNode }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-[13px] font-semibold text-text">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center rounded-sm border bg-white px-4 transition-colors focus-within:border-green-200",
          error ? "border-red-sale" : "border-border",
        )}
      >
        {prefix && <span className="mr-2 text-[15px] text-muted">{prefix}</span>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full w-full bg-transparent text-[15px] text-text outline-none placeholder:text-muted/70"
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
