import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cost of Living Calculator — GovPay.Directory";
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
              background: "#3B82F6",
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
          Cost of Living Calculator
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          See how far your federal salary goes in different cities. Adjust for
          housing, food, and transportation costs.
        </div>
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "auto",
          }}
        >
          {[
            { city: "San Francisco", index: "186" },
            { city: "Washington DC", index: "152" },
            { city: "Houston", index: "96" },
          ].map((item) => (
            <div
              key={item.city}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div style={{ fontSize: "16px", color: "#64748B" }}>
                {item.city}
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: parseInt(item.index) > 100 ? "#F59E0B" : "#10B981",
                }}
              >
                {item.index}
              </div>
              <div style={{ fontSize: "14px", color: "#64748B" }}>
                COL Index
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
