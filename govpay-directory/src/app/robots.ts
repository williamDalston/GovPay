import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Block indexing on non-production environments (Vercel previews, staging)
  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/search"],
      },
      // AI scraper bots — redundant with middleware 403 but best practice
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Google-Extended",
          "ClaudeBot",
          "Bytespider",
          "Amazonbot",
          "Omgilibot",
          "FacebookBot",
          "Diffbot",
          "Applebot-Extended",
          "PerplexityBot",
          "YouBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://www.govpay.directory/sitemap.xml",
  };
}
