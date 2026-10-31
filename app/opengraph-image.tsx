import { ImageResponse } from "next/og";

export const alt = "PROSPERA — Digital solutions and creative design for growing businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#090b08", color: "#f3f0e8", padding: "64px 76px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 32, letterSpacing: 5, fontFamily: "serif" }}>PROSPERA</span>
        <span style={{ fontSize: 17, color: "#caaa72" }}>Mumbai, India</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 75, lineHeight: 1.08, fontFamily: "serif", maxWidth: 950 }}>We build. We simplify.</div>
        <div style={{ fontSize: 29, color: "#caaa72" }}>We help businesses grow.</div>
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #49402e", paddingTop: 24, fontSize: 18, letterSpacing: 4, color: "#caaa72" }}>BUILD. GROW. PROSPER.</div>
    </div>,
    size,
  );
}
