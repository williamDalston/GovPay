import { ImageResponse } from "next/og";
import { getAgencyBySlug } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/format";

export const runtime = "edge";
export const alt = "Agency Salary Data";
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
  let agency;
  try {
    const { slug } = await params;
    agency = await getAgencyBySlug(slug);
  } catch {
    return fallbackImage("GovPay.Directory");
  }

  if (!agency) {
    return fallbackImage("Agency Not Found");
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

        {/* Abbreviation Badge */}
        {agency.abbreviation && (
          <div
            style={{
              display: "flex",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                background: "rgba(96, 165, 250, 0.2)",
                color: "#60A5FA",
                padding: "8px 20px",
                borderRadius: "8px",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              {agency.abbreviation}
            </div>
          </div>
        )}

        {/* Agency Name */}
        <div
          style={{
            fontSize: "46px",
            fontWeight: 700,
            color: "#E2E8F0",
            lineHeight: 1.15,
            marginBottom: "12px",
          }}
        >
          {agency.name}
        </div>
        <div style={{ fontSize: "22px", color: "#94A3B8" }}>
          Employee Salary Data
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
            <div style={{ fontSize: "16px", color: "#64748B" }}>Employees</div>
            <div
              style={{ fontSize: "42px", fontWeight: 700, color: "#60A5FA" }}
            >
              {formatNumber(agency.employeeCount)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>
              Avg Salary
            </div>
            <div
              style={{ fontSize: "42px", fontWeight: 700, color: "#34D399" }}
            >
              {formatCurrency(agency.averageSalary)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>
              Highest Salary
            </div>
            <div
              style={{ fontSize: "42px", fontWeight: 700, color: "#F59E0B" }}
            >
              {formatCurrency(agency.highestSalary)}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
