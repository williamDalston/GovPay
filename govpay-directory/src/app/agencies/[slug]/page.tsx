import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmployeeCard } from "@/components/EmployeeCard";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import dynamic from "next/dynamic";

const SalaryChart = dynamic(
  () => import("@/components/SalaryChart").then((m) => m.SalaryChart),
  {
    loading: () => (
      <div className="h-48 w-full animate-shimmer rounded-lg sm:h-64" />
    ),
    ssr: false,
  }
);
import { StatsBar } from "@/components/StatsBar";
import { getAgencyBySlug, getEmployeesByAgency, getAgencySlugs, getSalaryDistributionForAgency } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/format";
import { MapPin, Briefcase, Users, ArrowRight } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) return { title: "Agency Not Found" };

  return {
    title: `${agency.name} Employee Salaries`,
    description: `Explore salary data for ${formatNumber(agency.employeeCount)} employees at the ${agency.name}. Average salary: ${formatCurrency(agency.averageSalary)}. View top earners and occupation breakdown.`,
    alternates: { canonical: `https://govpay.directory/agencies/${slug}` },
  };
}

export async function generateStaticParams() {
  const slugs = await getAgencySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function AgencyPage({ params }: PageProps) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) notFound();

  const [{ employees }, distributionData] = await Promise.all([
    getEmployeesByAgency(slug, 6),
    getSalaryDistributionForAgency(slug),
  ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "GovernmentOrganization",
      name: agency.name,
      alternateName: agency.abbreviation || undefined,
      numberOfEmployees: {
        "@type": "QuantitativeValue",
        value: agency.employeeCount,
      },
      url: `https://govpay.directory/agencies/${slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How many employees does the ${agency.name} have?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `The ${agency.name} has approximately ${formatNumber(agency.employeeCount)} employees.`,
          },
        },
        {
          "@type": "Question",
          name: `What is the average salary at the ${agency.name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `The average salary at the ${agency.name} is ${formatCurrency(agency.averageSalary)}, with salaries ranging from ${formatCurrency(agency.lowestSalary)} to ${formatCurrency(agency.highestSalary)}.`,
          },
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Agencies", href: "/agencies" },
            { label: agency.name },
          ]}
        />

        <div className="flex items-start gap-3">
          {agency.abbreviation && (
            <span className="rounded bg-accent-blue/20 px-3 py-1 font-[family-name:var(--font-data)] text-sm font-bold text-accent-blue">
              {agency.abbreviation}
            </span>
          )}
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
              {agency.name}
            </h1>
            <p className="mt-1 text-navy-400">Employee Salary Data</p>
          </div>
        </div>

        <div className="mt-8">
          <StatsBar
            stats={[
              { label: "Total Employees", value: formatNumber(agency.employeeCount) },
              { label: "Average Salary", value: formatCurrency(agency.averageSalary) },
              { label: "Median Salary", value: formatCurrency(agency.medianSalary) },
              { label: "Highest Salary", value: formatCurrency(agency.highestSalary) },
            ]}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Salary Distribution */}
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
              <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
                Salary Distribution
              </h2>
              <div className="mt-4">
                <SalaryChart data={distributionData} />
              </div>
            </div>

            {/* Top Occupations */}
            <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
              <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
                Top Occupations
              </h2>
              <div className="mt-4">
                <table className="w-full" aria-label={`Top occupations at ${agency.name}`}>
                  <thead>
                    <tr className="border-b border-navy-700 text-left text-xs text-navy-500">
                      <th className="pb-2 font-medium">Occupation</th>
                      <th className="pb-2 text-right font-medium">Employees</th>
                      <th className="pb-2 text-right font-medium">Avg Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    {agency.topOccupations.map((occ) => (
                      <tr key={occ.title} className="text-sm transition-colors hover:bg-navy-800/50">
                        <td className="py-3 text-navy-200">
                          <span className="flex items-center gap-2">
                            <Briefcase size={12} className="text-navy-500" />
                            {occ.title}
                          </span>
                        </td>
                        <td className="py-3 text-right font-[family-name:var(--font-data)] text-navy-400">
                          {formatNumber(occ.count)}
                        </td>
                        <td className="py-3 text-right font-[family-name:var(--font-data)] text-accent-green">
                          {formatCurrency(occ.avgSalary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Employees */}
            {employees.length > 0 && (
              <div className="mt-6">
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
                  Featured Employees
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {employees.map((emp, index) => (
                    <AnimateOnScroll key={emp.id} delay={index * 60}>
                      <EmployeeCard employee={emp} />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* State Breakdown */}
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                Employees by State
              </h3>
              <div className="mt-3 space-y-2">
                {agency.stateBreakdown.map((sb) => (
                  <Link
                    key={sb.stateSlug}
                    href={`/states/${sb.stateSlug}`}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-navy-800"
                  >
                    <span className="flex items-center gap-2 text-navy-300">
                      <MapPin size={12} className="text-navy-500" />
                      {sb.state}
                    </span>
                    <span className="font-[family-name:var(--font-data)] text-xs text-navy-400">
                      {formatNumber(sb.count)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                Explore More
              </h3>
              <div className="mt-3 space-y-2">
                <Link
                  href={`/search?agency=${slug}`}
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <Users size={14} />
                  Search all {agency.abbreviation || agency.name} employees
                </Link>
                <Link
                  href="/tools/compare"
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <ArrowRight size={14} />
                  Compare agency salaries
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
