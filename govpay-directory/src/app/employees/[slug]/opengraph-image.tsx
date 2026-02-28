import { ImageResponse } from "next/og";
import { getEmployeeBySlug } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const runtime = "edge";
export const alt = "Employee Salary Profile";
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
  let employee;
  try {
    const { slug } = await params;
    employee = await getEmployeeBySlug(slug);
  } catch {
    return fallbackImage("GovPay.Directory");
  }

  if (!employee) {
    return fallbackImage("Employee Not Found");
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
            marginBottom: "16px",
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

        {/* Name */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#E2E8F0",
            marginBottom: "8px",
            lineHeight: 1.1,
          }}
        >
          {employee.name}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "26px",
            color: "#94A3B8",
            marginBottom: "40px",
          }}
        >
          {employee.jobTitle}
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>
              Total Compensation
            </div>
            <div
              style={{ fontSize: "42px", fontWeight: 700, color: "#34D399" }}
            >
              {formatCurrency(employee.totalCompensation)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>Agency</div>
            <div
              style={{ fontSize: "28px", fontWeight: 600, color: "#60A5FA" }}
            >
              {employee.agency}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#64748B" }}>Location</div>
            <div
              style={{ fontSize: "28px", fontWeight: 600, color: "#E2E8F0" }}
            >
              {employee.dutyStation}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
