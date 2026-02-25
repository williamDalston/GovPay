import { ImageResponse } from "next/og";
import { getStateBySlug } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/format";

export const runtime = "edge";
export const alt = "State Federal Employee Salary Data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function fallbackImage(text: string) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F1B2D",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E2E8F0",
          fontSize: "36px",
        }}
      >
        {text}
      </div>
    ),
    { ...size }
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  let state;
  try {
    const { slug } = await params;
    state = await getStateBySlug(slug);
  } catch {
    return fallbackImage("GovPay.Directory");
  }

  if (!state) {
    return fallbackImage("State Not Found");
  }

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
        {/* Header */}
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

        {/* State Badge */}
        <div style={{ display: "flex", marginBottom: "20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: "rgba(59, 130, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 700,
              color: "#3B82F6",
            }}
          >
            {state.abbreviation}
          </div>
        </div>

        {/* State Name */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#E2E8F0",
            marginBottom: "8px",
          }}
        >
          {state.name}
        </div>
        <div style={{ fontSize: "24px", color: "#94A3B8" }}>
          Federal Employee Salary Data
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            gap: "64px",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>
              Federal Employees
            </div>
            <div
              style={{ fontSize: "42px", fontWeight: 700, color: "#3B82F6" }}
            >
              {formatNumber(state.employeeCount)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>
              Avg Salary
            </div>
            <div
              style={{ fontSize: "42px", fontWeight: 700, color: "#10B981" }}
            >
              {formatCurrency(state.averageSalary)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>Agencies</div>
            <div
              style={{ fontSize: "42px", fontWeight: 700, color: "#F59E0B" }}
            >
              {state.agencies.length}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
