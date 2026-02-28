import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Government Salary Insights & Analysis";
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
          Insights & Analysis
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          Trends, comparisons, and analysis of government employee compensation
          data across America
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "auto",
            flexWrap: "wrap",
          }}
        >
          {["Agency Rankings", "State Comparisons", "Pay Scales", "Cost of Living"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "rgba(96, 165, 250, 0.15)",
                  color: "#60A5FA",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
