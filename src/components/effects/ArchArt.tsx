/** Placeholder for the hero arch photo: a gold-line tree on red velvet with twinkling lights.
    Swap for a real photo (gold tree on red velvet, warm light) once it's shot. */
export function ArchArt() {
  const lights: [number, number, number][] = [
    [128, 122, 0], [158, 148, -1.1], [108, 176, -0.4], [150, 196, -2], [182, 214, -0.8],
    [96, 238, -1.6], [132, 252, -0.2], [176, 266, -1.3], [204, 244, -2.4], [80, 270, -0.9],
  ];
  return (
    <svg viewBox="0 0 274 344" className="block size-full" role="img" aria-label="A gold Christmas tree glowing on red velvet">
      <defs>
        <radialGradient id="archGlow" cx="50%" cy="48%" r="60%">
          <stop offset="0" stopColor="#9C1626" />
          <stop offset="1" stopColor="#5E0A16" />
        </radialGradient>
        <radialGradient id="archHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#E9C76A" stopOpacity=".35" />
          <stop offset="1" stopColor="#E9C76A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="274" height="344" fill="url(#archGlow)" />
      {/* velvet folds */}
      <path d="M40 0Q30 170 46 344M100 0Q92 170 104 344M174 0Q182 170 170 344M234 0Q244 170 228 344" stroke="#000" strokeOpacity=".12" strokeWidth="14" fill="none" />
      <ellipse cx="137" cy="190" rx="120" ry="130" fill="url(#archHalo)" />
      {/* tree */}
      <g fill="none" stroke="url(#gGold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M137 92 104 146h16l-30 46h20l-36 54h126l-36-54h20l-30-46h16Z" fill="#E9C76A" fillOpacity=".08" />
        <path d="M131 246v22h12v-22" />
        <path d="M112 158q25 12 50 0M96 206q41 16 82 0" strokeOpacity=".7" />
      </g>
      <path d="M137 70C138.5 80 141 83 151 84C141 85 138.5 88 137 98C135.5 88 133 85 123 84C133 83 135.5 80 137 70Z" fill="url(#gGold)" />
      {lights.map(([x, y, d]) => (
        <g key={`${x}-${y}`} className="fx-twinkle" style={{ animationDelay: `${d}s` }}>
          <circle cx={x} cy={y} r="7" fill="#F3DC98" opacity=".25" />
          <circle cx={x} cy={y} r="2.4" fill="#FFF3CF" />
        </g>
      ))}
      {/* gifts at the base */}
      <rect x="70" y="276" width="46" height="34" rx="3" fill="#0B5E3E" />
      <path d="M93 276v34" stroke="#E9C76A" strokeWidth="5" />
      <rect x="154" y="282" width="52" height="28" rx="3" fill="#E9C76A" fillOpacity=".9" />
      <path d="M180 282v28" stroke="#9C1626" strokeWidth="5" />
      <path d="M30 312H244" stroke="#E9C76A" strokeOpacity=".35" />
    </svg>
  );
}
