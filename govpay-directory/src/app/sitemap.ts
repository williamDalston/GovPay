import { MetadataRoute } from "next";
import { getAllAgencies } from "@/lib/db";
import { US_STATES, GS_GRADES } from "@/lib/reference-data";
import { ARTICLES } from "@/lib/articles";

const BASE_URL = "https://www.govpay.directory";

// With 1.8M+ employee records, we NO LONGER include individual employee pages
// in the sitemap. Reasons:
// 1. Crawl budget - Google would spend all time on low-value pages
// 2. Index bloat - Dilutes site authority
// 3. Thin content risk - Employee pages have minimal unique content
// 4. Better strategy - Focus on aggregate pages (states, agencies) that rank
//    for high-intent queries like "Texas state employee salaries"
//
// Employee pages are still accessible via search and internal links,
// but we let Google discover them organically rather than pushing 40+ sitemaps.

// Fixed dates for pages that change infrequently — avoids always-now timestamps
// that erode Google's trust in the lastmod signal.
// Update these when running ETL or deploying significant changes.
const DATA_UPDATED = new Date("2026-02-27"); // Last ETL run (1.8M+ records loaded)
const SITE_UPDATED = new Date("2026-02-27"); // Last meaningful code deploy

export async function generateSitemaps() {
  // Single sitemap with high-value aggregate pages only
  // No longer generating 40+ sitemaps for individual employee pages
  return [{ id: 0 }];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages — /search intentionally excluded (client-rendered, noindex)
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: SITE_UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/agencies`, lastModified: DATA_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/states`, lastModified: DATA_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/pay-scales`, lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.8 },
    { url: `${BASE_URL}/pay-scales/gs`, lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.9 },
    { url: `${BASE_URL}/tools/compare`, lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/tools/cost-of-living`, lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/insights`, lastModified: DATA_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/terms`, lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const statePages: MetadataRoute.Sitemap = US_STATES.map((s) => ({
    url: `${BASE_URL}/states/${s.slug}`,
    lastModified: DATA_UPDATED,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const gradePages: MetadataRoute.Sitemap = GS_GRADES.map((g) => ({
    url: `${BASE_URL}/pay-scales/gs/${g}`,
    lastModified: SITE_UPDATED,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${BASE_URL}/insights/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // All high-value aggregate pages in a single sitemap
  let agencyPages: MetadataRoute.Sitemap = [];
  try {
    const agencies = await getAllAgencies();
    agencyPages = agencies.map((a) => ({
      url: `${BASE_URL}/agencies/${a.slug}`,
      lastModified: DATA_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    console.error("Failed to fetch agencies for sitemap");
  }

  return [...staticPages, ...articlePages, ...agencyPages, ...statePages, ...gradePages];
}
