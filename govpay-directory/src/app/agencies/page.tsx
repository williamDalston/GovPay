import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getAllAgencies } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { AgencyGrid } from "./AgencyGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Federal Agencies — Employee Salary Data",
  description:
    "Browse salary data across 450+ federal government agencies. View employee counts, average salaries, and top earners for each agency.",
  alternates: { canonical: "https://www.govpay.directory/agencies" },
};

export default async function AgenciesPage() {
  const agencies = await getAllAgencies();
  const totalEmployees = agencies.reduce((sum, a) => sum + a.employeeCount, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Federal Government Agencies",
    description: `Salary data for ${agencies.length}+ federal government agencies.`,
    numberOfItems: agencies.length,
    itemListElement: agencies.slice(0, 20).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.name,
      url: `https://www.govpay.directory/agencies/${a.slug}`,
    })),
  };

  // Pass only the fields needed for the client grid
  const agencyItems = agencies.map((a) => ({
    slug: a.slug,
    name: a.name,
    abbreviation: a.abbreviation,
    employeeCount: a.employeeCount,
    averageSalary: a.averageSalary,
    medianSalary: a.medianSalary,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Agencies" }]} />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Federal Government Agencies
      </h1>
      <p className="mt-2 text-navy-400">
        Explore compensation data across {formatNumber(totalEmployees)} federal employees
        in {agencies.length}+ agencies.
      </p>

      <AgencyGrid agencies={agencyItems} />
    </div>
    </>
  );
}
