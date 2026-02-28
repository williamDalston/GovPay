import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GS Pay Scale Tables — GovPay.Directory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0F1B2D 0%, #1E293B 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#60A5FA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "white",
            }}
          >
            GP
          </div>
          <div style={{ fontSize: "20px", color: "#64748B" }}>
            GovPay.Directory
          </div>
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#E2E8F0",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          GS Pay Scale
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          2026 General Schedule pay tables for all 15 grades and 10 steps.
          Includes locality pay adjustments for every metro area.
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "auto",
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map((grade) => (
            <div
              key={grade}
              style={{
                background:
                  grade >= 11 ? "rgba(96, 165, 250, 0.2)" : "#1E293B",
                color: grade >= 11 ? "#60A5FA" : "#94A3B8",
                width: "56px",
                height: "44px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              GS-{grade}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
