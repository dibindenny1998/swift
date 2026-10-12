/** Shared SVG gradients + symbols referenced by effects across the page. Render once per page. */
export function SvgSymbols() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3DC98" />
          <stop offset="1" stopColor="#C4952E" />
        </linearGradient>
        <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D3313F" />
          <stop offset="1" stopColor="#8A1220" />
        </linearGradient>
        <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A9A63" />
          <stop offset="1" stopColor="#0A5537" />
        </linearGradient>
        <linearGradient id="gBrown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9743F" />
          <stop offset="1" stopColor="#6A4120" />
        </linearGradient>
        <linearGradient id="gFur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4DED3" />
        </linearGradient>
        <radialGradient id="gSkin" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#FFDCC4" />
          <stop offset="1" stopColor="#EDB693" />
        </radialGradient>
        <symbol id="sFlake" viewBox="-12 -12 24 24">
          {/* faint green halo so white flakes stay visible on ivory, without a CSS filter */}
          <g stroke="rgba(11,94,62,.28)" strokeWidth="2.6" strokeLinecap="round" fill="none">
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <path key={r} transform={`rotate(${r})`} d="M0 0V-10M0-6.5L-3-9.5M0-6.5L3-9.5" />
            ))}
          </g>
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none">
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <path key={r} transform={`rotate(${r})`} d="M0 0V-10M0-6.5L-3-9.5M0-6.5L3-9.5" />
            ))}
          </g>
        </symbol>
        <symbol id="sStar" viewBox="0 0 24 24">
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="url(#gGold)" />
        </symbol>
        {(
          [
            ["sOrnGold", "url(#gGold)", "M4 30Q20 37 36 30", "#A97E20", "#FFF6D8", ".55"],
            ["sOrnRed", "url(#gRed)", "M5 32h30", "#E9C76A", "#F7B3BA", ".5"],
            ["sOrnGreen", "url(#gGreen)", "M5 32h30", "#E9C76A", "#BFE8D2", ".45"],
          ] as const
        ).map(([id, fill, band, bandColor, shine, shineOp]) => (
          <symbol key={id} id={id} viewBox="0 0 40 54">
            <rect x="15" y="6" width="10" height="6" rx="2" fill="#C4952E" />
            <path d="M17.5 6a2.5 2.5 0 0 1 5 0" stroke="#C4952E" strokeWidth="1.6" fill="none" />
            <ellipse cx="21" cy="37" rx="15" ry="13" fill="rgba(40,0,8,.18)" />
            <circle cx="20" cy="32" r="17" fill={fill} />
            <path d={band} stroke={bandColor} strokeWidth="1.4" fill="none" />
            <ellipse cx="13.5" cy="25" rx="3.5" ry="5.5" fill={shine} opacity={shineOp} />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

export function Star({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} aria-hidden>
      <use href="#sStar" />
    </svg>
  );
}

/** Ornament hanging on a thin gold thread, swaying gently. */
export function HangingOrnament({
  kind,
  thread,
  size,
  delay = 0,
  className,
  threadColor = "rgba(217,180,90,.7)",
}: {
  kind: "gold" | "red" | "green";
  thread: number;
  size: number;
  delay?: number;
  className?: string;
  threadColor?: string;
}) {
  const id = { gold: "sOrnGold", red: "sOrnRed", green: "sOrnGreen" }[kind];
  return (
    <div
      aria-hidden
      className={`fx-hang pointer-events-none absolute flex flex-col items-center ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="w-px" style={{ height: thread, background: threadColor }} />
      <svg width={size} height={Math.round(size * 1.35)}>
        <use href={`#${id}`} />
      </svg>
    </div>
  );
}
