// Gentle gold confetti that falls once. Hidden for reduced motion via data-ambient.
const PIECES = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
  return {
    left: `${(r(1) * 100).toFixed(1)}%`,
    delay: `${(r(2) * 1.2).toFixed(2)}s`,
    dur: `${(2.6 + r(3) * 1.6).toFixed(2)}s`,
    size: 5 + Math.round(r(4) * 5),
    drift: `${Math.round((r(5) - 0.5) * 80)}px`,
    spin: `${Math.round(r(6) * 540 + 180)}deg`,
    round: r(7) > 0.6,
    color: ["#E9C76A", "#F3DC98", "#C4952E", "#D9B45A"][i % 4],
  };
});

export function Confetti() {
  return (
    <div data-ambient aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-30 h-screen overflow-hidden">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            borderRadius: p.round ? 999 : 2,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.dur,
            ["--drift" as string]: p.drift,
            ["--spin" as string]: p.spin,
          }}
        />
      ))}
    </div>
  );
}
