import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Federal Agencies — Employee Salary Data | GovPay.Directory";
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
          Federal Government Agencies
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
          Browse salary data across 450+ federal agencies
        </div>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "48px",
          }}
        >
          {[
            { label: "Agencies", value: "450+" },
            { label: "Employees", value: "2M+" },
            { label: "Data Points", value: "10M+" },
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
                style={{ fontSize: "36px", fontWeight: 700, color: "#10B981" }}
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
