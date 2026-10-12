"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="h-11 rounded-full bg-green-300 px-6 text-sm font-semibold text-ivory">
      Print / Save as PDF
    </button>
  );
}
