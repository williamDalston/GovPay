import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchBar } from "@/components/SearchBar";
import { getAgencies } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Users, TrendingUp } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Federal Agencies — Employee Salary Data",
  description:
    "Browse salary data across 450+ federal government agencies. View employee counts, average salaries, and top earners for each agency.",
};

export default async function AgenciesPage() {
  const agencies = await getAgencies();
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
      url: `https://govpay.directory/agencies/${a.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Agencies" }]} />

      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
        Federal Government Agencies
      </h1>
      <p className="mt-2 text-navy-400">
        Explore compensation data across {formatNumber(totalEmployees)} federal employees
        in {agencies.length}+ agencies.
      </p>

      <div className="mt-6">
        <SearchBar placeholder="Search agencies..." />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agencies.map((agency) => (
          <Link
            key={agency.slug}
            href={`/agencies/${agency.slug}`}
            className="group rounded-xl border border-navy-700 bg-navy-900 p-6 transition-all hover:border-accent-blue/50 hover:bg-navy-800"
          >
            <div className="flex items-center gap-2">
              {agency.abbreviation && (
                <span className="rounded bg-navy-700 px-2 py-0.5 font-[family-name:var(--font-data)] text-xs font-bold text-accent-blue">
                  {agency.abbreviation}
                </span>
              )}
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100 group-hover:text-accent-blue sm:text-base line-clamp-2">
              {agency.name}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="truncate font-[family-name:var(--font-data)] text-base font-bold text-navy-100 sm:text-lg">
                  {formatNumber(agency.employeeCount)}
                </p>
                <p className="flex items-center gap-1 text-xs text-navy-500">
                  <Users size={10} className="shrink-0" /> Employees
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-[family-name:var(--font-data)] text-base font-bold text-accent-green sm:text-lg">
                  {formatCurrency(agency.averageSalary)}
                </p>
                <p className="flex items-center gap-1 text-xs text-navy-500">
                  <TrendingUp size={10} className="shrink-0" /> Avg Salary
                </p>
              </div>
            </div>
            <p className="mt-3 truncate text-xs text-navy-500">
              Range: {formatCurrency(agency.lowestSalary)} –{" "}
              {formatCurrency(agency.highestSalary)}
            </p>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
