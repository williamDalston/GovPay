import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Federal Pay Scales — GovPay.Directory";
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
          alignItems: "center",
          justifyContent: "center",
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
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "#3B82F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 700,
              color: "white",
            }}
          >
            GP
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#94A3B8" }}>
            GovPay<span style={{ color: "#3B82F6" }}>.Directory</span>
          </div>
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#E2E8F0",
            marginBottom: "16px",
          }}
        >
          Federal Pay Scales
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          Browse GS grades, steps, and locality adjustments for government
          employees
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          {[
            { label: "GS-1 Min", value: "$21,756" },
            { label: "GS-12 Mid", value: "$88,520" },
            { label: "GS-15 Max", value: "$191,900" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#1a2332",
                borderRadius: "12px",
                padding: "16px 32px",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{ fontSize: "28px", fontWeight: 700, color: "#10B981" }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
