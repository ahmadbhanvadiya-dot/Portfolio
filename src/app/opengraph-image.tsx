import { ImageResponse } from "next/og";

export const alt = "Ahmad Bhanvadiya. I build things you can open.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#121210",
          color: "#edebe5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 5,
              background: "#edebe5",
              color: "#121210",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            AB
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.02, letterSpacing: -3 }}>
          <span>Ahmad Bhanvadiya.</span>
          <span style={{ color: "#9b978e" }}>I build things you can open.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: "#9b978e" }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: "#7f93ff" }} />
          Open to internships &amp; collaborations
        </div>
      </div>
    ),
    size,
  );
}
