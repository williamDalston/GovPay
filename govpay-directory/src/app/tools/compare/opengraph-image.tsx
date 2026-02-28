import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Compare Federal Salaries — GovPay.Directory";
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
          Compare Salaries
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          Side-by-side comparison of GS grades, steps, and locality pay areas.
          See how your compensation stacks up.
        </div>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "auto",
            alignItems: "flex-end",
          }}
        >
          {[
            { label: "GS-7", height: "80px", color: "#334155" },
            { label: "GS-9", height: "120px", color: "#334155" },
            { label: "GS-11", height: "160px", color: "#60A5FA" },
            { label: "GS-13", height: "220px", color: "#334155" },
            { label: "GS-15", height: "280px", color: "#334155" },
          ].map((bar) => (
            <div
              key={bar.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: bar.height,
                  background: bar.color,
                  borderRadius: "8px 8px 0 0",
                }}
              />
              <div style={{ fontSize: "14px", color: "#94A3B8" }}>
                {bar.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
