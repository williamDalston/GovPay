import { MetadataRoute } from "next";
import { getAllAgencies, getEmployeeCount, getEmployeeSlugs } from "@/lib/db";
import { US_STATES, GS_GRADES } from "@/lib/reference-data";
import { ARTICLES } from "@/lib/articles";

const BASE_URL = "https://govpay.directory";
const URLS_PER_SITEMAP = 45000;

// Fixed dates for pages that change infrequently — avoids always-now timestamps
// that erode Google's trust in the lastmod signal.
// Update these when running ETL or deploying significant changes.
const DATA_UPDATED = new Date("2026-02-15"); // Last ETL run
const SITE_UPDATED = new Date("2026-02-20"); // Last meaningful code deploy

export async function generateSitemaps() {
  const employeeCount = await getEmployeeCount();
  const numEmployeeSitemaps = Math.ceil(employeeCount / URLS_PER_SITEMAP);
  // id 0 = static + agencies + states + grades
  // id 1..N = employee pages
  return Array.from({ length: numEmployeeSitemaps + 1 }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  if (id === 0) {
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

    const agencies = await getAllAgencies();
    const agencyPages: MetadataRoute.Sitemap = agencies.map((a) => ({
      url: `${BASE_URL}/agencies/${a.slug}`,
      lastModified: DATA_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

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

    return [...staticPages, ...articlePages, ...agencyPages, ...statePages, ...gradePages];
  }

  // Employee pages (paginated by sitemap id)
  const offset = (id - 1) * URLS_PER_SITEMAP;
  const slugs = await getEmployeeSlugs(offset, URLS_PER_SITEMAP);

  return slugs.map((slug) => ({
    url: `${BASE_URL}/employees/${slug}`,
    lastModified: DATA_UPDATED,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
}
