import { HangingOrnament } from "./Symbols";

const BEADS: [number, number, number, string, number][] = [
  [48.6, 22.7, 3, "#F3DC98", 0],
  [97, 29, 3.6, "#E9C76A", -0.8],
  [146, 24.7, 3, "#F3DC98", -1.6],
  [243.6, 24.7, 3, "#F3DC98", -0.4],
  [292, 29, 3.6, "#E9C76A", -1.2],
  [341, 22.7, 3, "#F3DC98", -2],
];

/** Gold swag across the top of the hero: twinkling beads, a bow, and two swaying ornaments. */
export function Garland() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[2] mx-auto max-w-[560px]">
      <svg viewBox="0 0 390 60" className="block w-full">
        <path d="M0 6Q97 50 195 10Q292 50 390 6" stroke="url(#gGold)" strokeWidth="1.5" fill="none" />
        {BEADS.map(([cx, cy, r, fill, delay]) => (
          <circle key={cx} className="fx-bead" cx={cx} cy={cy} r={r} fill={fill} style={{ animationDelay: `${delay}s` }} />
        ))}
        <path
          d="M195 10C186 2 178 6 184 11C187 13 192 11 195 10C198 11 203 13 206 11C212 6 204 2 195 10Z"
          fill="url(#gGold)"
        />
        <circle cx="195" cy="10" r="2.6" fill="#A97E20" />
      </svg>
      <HangingOrnament kind="gold" thread={40} size={26} className="left-[11%] top-[22px]" />
      <HangingOrnament kind="green" thread={30} size={20} delay={-4} className="right-[23%] top-[28px]" />
    </div>
  );
}

export function Bokeh() {
  return (
    <div data-ambient aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="fx-bokeh right-[12%] top-[300px] size-14" style={{ animationDelay: "-3s" }} />
      <span className="fx-bokeh left-[9%] top-[560px] size-9" style={{ animationDelay: "-5s" }} />
      <span className="fx-bokeh right-[8%] top-[800px] size-11" style={{ animationDelay: "-1.5s" }} />
    </div>
  );
}
