import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GovPay.Directory — Public Employee Compensation Explorer";
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
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "12px",
              background: "#60A5FA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "white",
            }}
          >
            GP
          </div>
          <div style={{ fontSize: "48px", fontWeight: 700, color: "#E2E8F0" }}>
            GovPay
            <span style={{ color: "#60A5FA" }}>.Directory</span>
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#94A3B8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Search and compare compensation data for over 2 million federal,
          state, and local government employees
        </div>
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "48px",
          }}
        >
          {[
            { label: "Employees", value: "2M+" },
            { label: "Agencies", value: "450+" },
            { label: "States", value: "50" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: "#34D399",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "16px", color: "#64748B" }}>
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
