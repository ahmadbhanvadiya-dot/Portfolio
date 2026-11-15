import { ImageResponse } from "next/og";

export const alt = "Ahmad Bhanvadiya. Building thoughtful digital experiences.";
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
          background: "#f5f3ee",
          color: "#161513",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 5,
              background: "#161513",
              color: "#f5f3ee",
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
          <span style={{ color: "#67645d" }}>Building thoughtful digital experiences.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: "#67645d" }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: "#2e43c4" }} />
          Open to internships &amp; collaborations
        </div>
      </div>
    ),
    size,
  );
}
