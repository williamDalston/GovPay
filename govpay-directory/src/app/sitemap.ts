import { MetadataRoute } from "next";
import { getAgencies, getEmployeeCount, getEmployeeSlugs } from "@/lib/db";
import { US_STATES, GS_GRADES } from "@/lib/reference-data";

const BASE_URL = "https://govpay.directory";
const URLS_PER_SITEMAP = 45000;

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
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      { url: `${BASE_URL}/agencies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${BASE_URL}/states`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
      { url: `${BASE_URL}/pay-scales/gs`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.9 },
      { url: `${BASE_URL}/tools/compare`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
      { url: `${BASE_URL}/tools/cost-of-living`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
      { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
      { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
      { url: `${BASE_URL}/insights`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    ];

    const agencies = await getAgencies();
    const agencyPages: MetadataRoute.Sitemap = agencies.map((a) => ({
      url: `${BASE_URL}/agencies/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const statePages: MetadataRoute.Sitemap = US_STATES.map((s) => ({
      url: `${BASE_URL}/states/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const gradePages: MetadataRoute.Sitemap = GS_GRADES.map((g) => ({
      url: `${BASE_URL}/pay-scales/gs/${g}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...agencyPages, ...statePages, ...gradePages];
  }

  // Employee pages (paginated by sitemap id)
  const offset = (id - 1) * URLS_PER_SITEMAP;
  const slugs = await getEmployeeSlugs(offset, URLS_PER_SITEMAP);

  return slugs.map((slug) => ({
    url: `${BASE_URL}/employees/${slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
}
