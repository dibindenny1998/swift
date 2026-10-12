"use client";

import { useEffect, useState } from "react";
import { addToCart, type AddInput } from "@/lib/cart-store";
import { cn } from "@/lib/cn";

export function AddButton({ input, title, label = "Add", className }: { input: AddInput; title: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "added" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (state !== "added" && state !== "error") return;
    const t = setTimeout(() => setState("idle"), state === "error" ? 3500 : 1600);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <span className="relative inline-flex flex-col items-end">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={async () => {
          setState("busy");
          try {
            await addToCart(input);
            setState("added");
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "Couldn't add that");
            setState("error");
          }
        }}
        aria-label={`Add ${title} to cart`}
        className={cn(
          "inline-flex h-11 min-w-[76px] items-center justify-center gap-1.5 rounded-full bg-green-300 px-5 text-sm font-semibold text-ivory transition-[transform,background-color,opacity] duration-150 active:scale-[0.98] disabled:opacity-70",
          state === "added" && "bg-green-200",
          className,
        )}
      >
        {state === "added" ? (
          <>
            <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
            </svg>
            Added
          </>
        ) : state === "busy" ? (
          "Adding…"
        ) : (
          label
        )}
      </button>
      {state === "error" && (
        <span role="alert" className="absolute right-0 top-full mt-1 w-max max-w-[220px] text-right text-xs text-red-sale">
          {message}
        </span>
      )}
    </span>
  );
}
