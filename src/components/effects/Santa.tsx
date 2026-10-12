/** Santa, sleigh and reindeer. Flies in once per page load and lands on the H1, then bobs and waves. */
export function Santa({ className }: { className?: string }) {
  const puffs = [
    { left: 20, dx: -18, s: 7 },
    { left: 46, dx: -8, s: 5 },
    { left: 80, dx: 4, s: 7 },
    { left: 104, dx: 14, s: 5 },
    { left: 120, dx: 22, s: 7 },
  ];
  return (
    <div aria-hidden className={`santa-land pointer-events-none absolute w-[170px] ${className ?? ""}`}>
      {puffs.map((p) => (
        <span
          key={p.left}
          className="santa-puff"
          style={{ left: p.left, width: p.s, height: p.s, ["--dx" as string]: `${p.dx}px` }}
        />
      ))}
      <div className="santa-bob">
        <svg
          width="170"
          height="78"
          viewBox="0 0 240 110"
          className="overflow-visible"
          style={{ filter: "drop-shadow(0 10px 10px rgba(40,0,8,.38))" }}
        >
          {/* sleigh runners */}
          <path d="M14 98H132Q152 98 152 82Q152 72 142 72" stroke="url(#gGold)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M42 86V98M112 86V98" stroke="url(#gGold)" strokeWidth="4" strokeLinecap="round" />
          {/* gift sack */}
          <path d="M38 56Q30 30 48 26Q58 23 64 30Q74 40 66 56Z" fill="url(#gGold)" />
          <ellipse cx="47" cy="38" rx="4" ry="7" fill="#FFF6D8" opacity=".5" />
          <rect x="48" y="23" width="14" height="5" rx="2.5" fill="#A97E20" />
          {/* Santa's body + belt */}
          <ellipse cx="86" cy="52" rx="21" ry="19" fill="url(#gRed)" />
          <ellipse cx="80" cy="44" rx="7" ry="5" fill="#F2717E" opacity=".45" />
          <rect x="65" y="52" width="42" height="6" rx="3" fill="#2A1A14" />
          <rect x="81" y="50.5" width="10" height="9" rx="2" fill="none" stroke="url(#gGold)" strokeWidth="2" />
          {/* sleigh body */}
          <path d="M12 44Q12 30 26 30Q34 30 34 40V56H126Q140 56 145 45Q150 82 117 88H24Q12 88 12 76Z" fill="url(#gGreen)" />
          <path d="M17 42Q18 35 25 34" stroke="#FFFFFF" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M34 56H126Q140 56 145 45" stroke="url(#gGold)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 72q10-8 20 0t20 0t20 0" stroke="url(#gGold)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M30 80H110" stroke="#FFFFFF" strokeOpacity=".12" strokeWidth="3" strokeLinecap="round" />
          {/* waving arm */}
          <g className="santa-wave">
            <path d="M100 42L116 27" stroke="url(#gRed)" strokeWidth="10" strokeLinecap="round" />
            <circle cx="114" cy="29" r="5" fill="url(#gFur)" />
            <circle cx="118" cy="24" r="6" fill="url(#gGreen)" />
          </g>
          {/* face, beard, hat */}
          <circle cx="86" cy="27" r="12" fill="url(#gSkin)" />
          <circle cx="78" cy="31" r="3.4" fill="#F59AA4" opacity=".7" />
          <circle cx="94" cy="31" r="3.4" fill="#F59AA4" opacity=".7" />
          <path d="M80 25q2.2-2.4 4.4 0M88 25q2.2-2.4 4.4 0" stroke="#3A2A20" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M72 29Q72 50 86 50Q100 50 100 29Q94 36 86 35Q78 36 72 29Z" fill="url(#gFur)" />
          <path d="M79 33q7 4.5 14 0" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <circle cx="86" cy="30" r="2.8" fill="#EE9C80" />
          <path d="M73 20Q77 2 94 6Q103 9 107 19L96 21Z" fill="url(#gRed)" />
          <rect x="71" y="16" width="30" height="8" rx="4" fill="url(#gFur)" />
          <circle cx="109" cy="19" r="5" fill="url(#gFur)" />
          {/* reins */}
          <path d="M118 26Q152 40 186 47" stroke="url(#gGold)" strokeWidth="1.6" fill="none" />
          {/* reindeer legs (gallop during the flight) */}
          <g className="santa-leg" style={{ transformOrigin: "158px 60px" }}>
            <path d="M158 60L154 84" stroke="#6A4120" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g className="santa-leg b" style={{ transformOrigin: "166px 62px" }}>
            <path d="M166 62L170 84" stroke="#5A361A" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g className="santa-leg b" style={{ transformOrigin: "182px 62px" }}>
            <path d="M182 62L178 84" stroke="#6A4120" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g className="santa-leg" style={{ transformOrigin: "190px 60px" }}>
            <path d="M190 60L194 84" stroke="#5A361A" strokeWidth="5" strokeLinecap="round" />
          </g>
          {/* reindeer */}
          <circle cx="147" cy="52" r="4.5" fill="url(#gFur)" />
          <ellipse cx="174" cy="56" rx="27" ry="13" fill="url(#gBrown)" />
          <ellipse cx="174" cy="62" rx="17" ry="5" fill="#D2A673" opacity=".55" />
          <path d="M192 52L200 35" stroke="url(#gBrown)" strokeWidth="11" strokeLinecap="round" />
          <path d="M190 47L201 51" stroke="url(#gGold)" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="196" cy="53" r="3.2" fill="url(#gGold)" />
          <ellipse cx="205" cy="32" rx="12" ry="8.5" fill="url(#gBrown)" />
          <ellipse cx="198" cy="25" rx="3" ry="5" fill="#8A5A2E" transform="rotate(-30 198 25)" />
          <circle cx="205" cy="29" r="1.6" fill="#2A1A14" />
          <circle cx="205.6" cy="28.4" r=".5" fill="#FFFFFF" />
          <path d="M200 23L195 11M196 15L189 11M207 22L212 10M211 14L218 11" stroke="#E2C18A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle className="santa-nose" cx="215" cy="32" r="5.5" fill="#FF6B6B" />
          <circle cx="215" cy="32" r="3.2" fill="#E53935" />
          <circle cx="214" cy="31" r="1" fill="#FFC4C4" />
        </svg>
      </div>
    </div>
  );
}
