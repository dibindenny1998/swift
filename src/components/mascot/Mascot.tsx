"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import "./mascot.css";

// Eye geometry in the 664×880 artwork, used for the blink lids.
const EYES = [
  { id: "l", cx: 235, cy: 294, rx: 41, ry: 43 },
  { id: "r", cx: 359, cy: 248, rx: 31, ry: 40 },
];

function Lids() {
  return (
    <svg viewBox="0 0 664 880" className="msc-layer" aria-hidden>
      <defs>
        <linearGradient id="mascot-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3E5EE" />
        </linearGradient>
        {EYES.map((e) => (
          <clipPath key={e.id} id={`mascot-eye-${e.id}`}>
            <ellipse cx={e.cx} cy={e.cy} rx={e.rx + 2} ry={e.ry + 2} />
          </clipPath>
        ))}
      </defs>
      {EYES.map((e) => {
        const top = e.cy - e.ry - 4;
        const h = e.ry * 2 + 8;
        return (
          <g key={e.id} clipPath={`url(#mascot-eye-${e.id})`}>
            {/* Lid parked just above the eye; drops by its own height to close. */}
            <g className="msc-lid" style={{ ["--lid-drop" as string]: `${h}px` }}>
              <rect x={e.cx - e.rx - 4} y={top - h} width={e.rx * 2 + 8} height={h} fill="url(#mascot-lid)" />
              <path
                d={`M${e.cx - e.rx - 4} ${top - 6} Q${e.cx} ${top + 6} ${e.cx + e.rx + 4} ${top - 6}`}
                stroke="#3B2A26"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function Flake() {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
        {[0, 60, 120, 180, 240, 300].map((r) => (
          <path key={r} transform={`rotate(${r})`} d="M0 0V-10M0-6.5L-3-9.5M0-6.5L3-9.5" />
        ))}
      </g>
    </svg>
  );
}

function SnowAngel() {
  return (
    <svg viewBox="0 0 160 60" className="msc-angel" aria-hidden>
      <circle cx="16" cy="30" r="12" fill="#E8DEC6" stroke="#D3C59F" />
      <path d="M34 30Q50-2 96 6Q82 20 94 30Q82 40 96 54Q50 62 34 30Z" fill="#E8DEC6" stroke="#D3C59F" />
      <path d="M94 30Q122 2 158 12Q148 30 158 48Q122 58 94 30Z" fill="#E8DEC6" stroke="#D3C59F" />
      <path d="M30 8l2 4 4 1-4 1-2 4-2-4-4-1 4-1z" fill="#E9C76A" />
      <path d="M120 52l1.5 3 3 .8-3 .8-1.5 3-1.5-3-3-.8 3-.8z" fill="#E9C76A" />
    </svg>
  );
}

/**
 * The swift.in snowman. `scene` plays the footer routine (hops, waves, snow angel);
 * otherwise he idles (breathes, sways, blinks). Tapping him always waves hello.
 */
export function Mascot({
  width = 140,
  scene = false,
  greeting = "Hi! Merry Christmas",
  className,
}: {
  width?: number;
  scene?: boolean;
  greeting?: string;
  className?: string;
}) {
  const [hello, setHello] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const sayHi = useCallback(() => {
    clearTimeout(timer.current);
    // Re-keying restarts the CSS animations on repeated taps.
    setHello((n) => n + 1);
    timer.current = setTimeout(() => setHello(0), 2400);
  }, []);

  const img = (src: string) => (
    <Image src={src} alt="" fill sizes={`${width * 2}px`} draggable={false} priority={false} />
  );

  return (
    <div
      className={cn("msc-root", scene && "msc-scene", hello > 0 && "msc-hello", className)}
      style={{ width }}
    >
      {scene && <SnowAngel />}
      <span className="msc-shadow" aria-hidden />
      <button type="button" className="msc-hit" onClick={sayHi} aria-label="Say hi to the snowman">
        <div className={cn("msc-layer", "msc-act")}>
          <div key={hello} className={cn("msc-layer", "msc-hop")}>
            <div className={cn("msc-layer", "msc-breathe")}>
              <div className="msc-layer">{img("/mascot/body.png")}</div>
              <div className={cn("msc-layer", "msc-armL")}>
                <div className={cn("msc-layer", "msc-pose")}>
                  <div className={cn("msc-layer", "msc-sway")}>{img("/mascot/arm-left.png")}</div>
                </div>
              </div>
              <div className={cn("msc-layer", "msc-armR")}>
                <div className={cn("msc-layer", "msc-pose")}>
                  <div className={cn("msc-layer", "msc-sway")}>
                    <div className={cn("msc-layer", "msc-wave")}>{img("/mascot/arm-right.png")}</div>
                  </div>
                </div>
              </div>
              <Lids />
            </div>
          </div>
        </div>
      </button>
      {scene && (
        <span className="msc-flake" aria-hidden>
          <Flake />
        </span>
      )}
      {scene && (
        // Stays mounted so it never drifts out of sync with the 14s routine; hidden while saying hi.
        <span className={cn("msc-bubble", "msc-sceneBubble")} style={hello > 0 ? { visibility: "hidden" } : undefined} aria-hidden>
          {greeting}
        </span>
      )}
      {hello > 0 && (
        <span key={hello} className={cn("msc-bubble", "msc-helloBubble")} role="status">
          {greeting}
        </span>
      )}
    </div>
  );
}
