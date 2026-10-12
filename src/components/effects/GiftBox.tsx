import { Star } from "./Symbols";

/** Red box, gold ribbon; the lid hops open every ~4s and three gold stars burst out. */
export function GiftBoxAnim() {
  return (
    <div aria-hidden className="relative h-[120px] w-[130px]">
      <Star size={14} className="gift-burst left-[34px] top-[26px]" />
      <span className="gift-burst left-[56px] top-[14px]" style={{ animationDelay: ".15s" }}>
        <Star size={18} />
      </span>
      <span className="gift-burst left-[84px] top-[24px]" style={{ animationDelay: ".3s" }}>
        <Star size={12} />
      </span>
      <svg width="130" height="120" viewBox="0 0 120 110" style={{ filter: "drop-shadow(0 10px 10px rgba(0,30,15,.4))" }}>
        <rect x="22" y="50" width="76" height="56" rx="6" fill="url(#gRed)" />
        <rect x="55" y="50" width="10" height="56" fill="url(#gGold)" />
        <g className="gift-lid">
          <rect x="16" y="36" width="88" height="18" rx="5" fill="url(#gRed)" />
          <rect x="55" y="36" width="10" height="18" fill="url(#gGold)" />
          <path d="M60 36C48 16 32 22 41 31C45 34 54 36 60 36C66 36 75 34 79 31C88 22 72 16 60 36Z" fill="url(#gGold)" />
        </g>
      </svg>
    </div>
  );
}
