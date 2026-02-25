import { NextRequest, NextResponse } from "next/server";
import { searchEmployees, searchAgencies } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok, headers: rlHeaders } = rateLimit(ip);

  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { ...rlHeaders, "Retry-After": "60" } }
    );
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 200);
  const page = Math.min(
    Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1") || 1),
    500
  );
  const agency = request.nextUrl.searchParams.get("agency");
  const state = request.nextUrl.searchParams.get("state");

  if (!q.trim() && !agency && !state) {
    return NextResponse.json({ employees: [], agencies: [], total: 0 });
  }

  try {
    const [employeeResult, agencies] = await Promise.all([
      searchEmployees(q, { agency, state }, page),
      q ? searchAgencies(q) : Promise.resolve([]),
    ]);

    return NextResponse.json(
      {
        employees: employeeResult.employees,
        agencies,
        total: employeeResult.total,
        page,
      },
      {
        headers: {
          ...rlHeaders,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
