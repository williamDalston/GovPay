import { NextRequest, NextResponse } from "next/server";
import { getSuggestions } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok, headers: rlHeaders } = rateLimit(ip);

  if (!ok) {
    return NextResponse.json(
      { employees: [], agencies: [] },
      { status: 429, headers: { ...rlHeaders, "Retry-After": "60" } }
    );
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 200);

  if (q.trim().length < 2) {
    return NextResponse.json({ employees: [], agencies: [] });
  }

  try {
    const suggestions = await getSuggestions(q);
    return NextResponse.json(suggestions, {
      headers: {
        ...rlHeaders,
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Suggest error:", error);
    return NextResponse.json(
      { employees: [], agencies: [] },
      { status: 500, headers: rlHeaders }
    );
  }
}
