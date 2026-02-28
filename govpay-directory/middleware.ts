import { NextRequest, NextResponse } from "next/server";

const BLOCKED_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "anthropic-ai",
  "Google-Extended",
  "ClaudeBot",
  "Bytespider",
  "Amazonbot",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get("user-agent") ?? "";

  // Block AI scraper bots with 403
  if (BLOCKED_BOTS.some((bot) => ua.includes(bot))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Normalize uppercase paths to lowercase canonical form (308 Permanent Redirect)
  const lowered = pathname.toLowerCase();
  if (pathname !== lowered) {
    const url = request.nextUrl.clone();
    url.pathname = lowered;
    return NextResponse.redirect(url, 308);
  }

  // Strip trailing slashes (except root)
  if (pathname !== "/" && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|sitemap|robots).*)",
  ],
};
