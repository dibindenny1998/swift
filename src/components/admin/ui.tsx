import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[30px] font-medium leading-tight text-green-heading">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, className, children, actions }: { title?: string; className?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-lg border border-border bg-white p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const btn = {
  primary: "bg-green-300 text-ivory hover:bg-green-400",
  secondary: "border border-border bg-white text-text hover:border-green-300/40",
  danger: "border border-red-sale/30 bg-white text-red-sale hover:bg-red-sale/5",
  gold: "bg-[image:var(--grad-gold-btn)] text-gold-on",
};

export function adminBtn(kind: keyof typeof btn = "primary", className?: string) {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-[transform,background-color] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    btn[kind],
    className,
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-display text-[30px] leading-none text-green-heading tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const tones: Record<string, string> = {
  green: "bg-green-300/10 text-green-300",
  gold: "bg-gold-light/50 text-gold-ink",
  red: "bg-red-sale/10 text-red-sale",
  grey: "bg-divider text-muted",
};

export function Pill({ tone = "grey", children }: { tone?: keyof typeof tones | string; children: ReactNode }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone] ?? tones.grey)}>{children}</span>;
}

export function orderStatusTone(status: string) {
  if (status === "DELIVERED") return "green";
  if (status === "CANCELLED" || status === "RETURNED") return "grey";
  if (status === "PENDING") return "gold";
  return "green";
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className={cn("w-full min-w-[640px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-muted [&_tbody_tr]:border-t [&_tbody_tr]:border-divider", className)} {...props} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-divider bg-white px-5 py-10 text-center text-sm text-muted">{children}</p>;
}

export function AdminSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-9 w-56 rounded-full bg-divider/70" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-lg bg-divider/50" />
        <div className="h-28 rounded-lg bg-divider/50" />
        <div className="h-28 rounded-lg bg-divider/50" />
      </div>
      <div className="mt-6 h-72 rounded-lg bg-divider/40" />
    </div>
  );
}
