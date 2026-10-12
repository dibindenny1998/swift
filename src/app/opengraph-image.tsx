import { ImageResponse } from "next/og";

export const alt = "swift.in — Christmas, wrapped in gold";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default share image for every page without its own (red velvet + gold, like the hero). */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #DA2E40 0%, #9C1626 55%, #4E0812 100%)",
          color: "#FBF7EE",
          fontFamily: "serif",
        }}
      >
        <div style={{ position: "absolute", inset: 28, border: "2px solid rgba(217,180,90,.55)", borderRadius: 40, display: "flex" }} />
        <div style={{ fontSize: 30, letterSpacing: 10, color: "#F3DC98", display: "flex" }}>CHRISTMAS 2026</div>
        <div style={{ fontSize: 96, marginTop: 24, display: "flex" }}>
          <span style={{ color: "#F3DC98" }}>swift</span>
          <span style={{ fontStyle: "italic" }}>.in</span>
        </div>
        <div style={{ fontSize: 44, marginTop: 18, display: "flex" }}>
          Christmas, wrapped in&nbsp;<span style={{ color: "#E9C76A", fontStyle: "italic" }}>gold</span>
        </div>
        <div style={{ fontSize: 26, marginTop: 30, color: "#F8DADD", display: "flex" }}>Trees · Lights · Ornaments · Gifts — delivered across India</div>
      </div>
    ),
    size,
  );
}
