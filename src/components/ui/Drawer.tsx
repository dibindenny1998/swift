"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Modal drawer from the right (cart, menu) or bottom (filters on mobile). Escape and backdrop close it. */
export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "right" | "left" | "bottom";
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  const offscreen = side === "bottom" ? { y: "100%" } : { x: side === "right" ? "100%" : "-100%" };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-green-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              "absolute flex flex-col bg-ivory outline-none shadow-2xl",
              side === "bottom"
                ? "inset-x-0 bottom-0 max-h-[85vh] rounded-t-lg"
                : cn("inset-y-0 w-[min(88vw,420px)]", side === "right" ? "right-0" : "left-0"),
            )}
            initial={offscreen}
            animate={{ x: 0, y: 0 }}
            exit={offscreen}
            transition={reduce ? { duration: 0 } : { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
          >
            <div className="flex items-center justify-between border-b border-divider px-5 py-3">
              <h2 className="font-display text-[22px] font-medium text-green-heading">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-black/5"
              >
                <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 3l12 12M15 3 3 15" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
