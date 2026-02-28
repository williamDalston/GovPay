import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "About GovPay.Directory";
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
          About GovPay.Directory
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          A free, open resource for exploring public employee compensation data.
          Promoting transparency in government spending.
        </div>
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "auto",
          }}
        >
          {[
            { label: "Employees", value: "2M+" },
            { label: "Agencies", value: "450+" },
            { label: "Data Source", value: "OPM" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div style={{ fontSize: "16px", color: "#64748B" }}>
                {stat.label}
              </div>
              <div
                style={{ fontSize: "36px", fontWeight: 700, color: "#34D399" }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
