import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmployeeCard } from "@/components/EmployeeCard";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { StatsBar } from "@/components/StatsBar";
import { getStateBySlug } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/format";
import { US_STATES, STATE_NEIGHBORS } from "@/lib/reference-data";
import { AdSlot } from "@/components/AdSlot";
import { ShareButton } from "@/components/ShareButton";
import { Building2, Users, ArrowRight } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const state = await getStateBySlug(slug);
  if (!state) return { title: "State Not Found" };

  const hasData = state.employeeCount > 0;
  
  return {
    title: `${state.name} Government Employee Salaries ${new Date().getFullYear()}`,
    description: hasData
      ? `Search ${formatNumber(state.employeeCount)} ${state.name} government employee salaries. Average pay: ${formatCurrency(state.averageSalary)}. Browse by agency, job title, and more.`
      : `${state.name} government employee salary data coming soon. Browse federal pay scales and other states with available data.`,
    alternates: { canonical: `https://www.govpay.directory/states/${slug}` },
    // Don't index empty state pages
    ...((!hasData) && { robots: { index: false, follow: true } }),
  };
}

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ slug: s.slug }));
}

export default async function StatePage({ params }: PageProps) {
  const { slug } = await params;
  const state = await getStateBySlug(slug);
  if (!state) notFound();

  const sortedAgencies = [...state.agencies].sort((a, b) => b.count - a.count);
  const topAgency = sortedAgencies.length > 0 ? sortedAgencies[0] : null;
  const topEarner = state.topEarners.length > 0 ? state.topEarners[0] : null;

  const faqItems = [
    {
      q: `How many federal employees work in ${state.name}?`,
      a: `There are approximately ${formatNumber(state.employeeCount)} federal employees in ${state.name} across ${state.agencies.length} agencies.${topAgency ? ` The largest employer is the ${topAgency.name} with ${formatNumber(topAgency.count)} employees.` : ""}`,
    },
    {
      q: `What is the average federal salary in ${state.name}?`,
      a: `The average federal employee salary in ${state.name} is ${formatCurrency(state.averageSalary)}, with a median of ${formatCurrency(state.medianSalary)}. Salaries vary widely based on agency, GS grade, and position.`,
    },
    {
      q: `Which federal agency employs the most people in ${state.name}?`,
      a: topAgency
        ? `The ${topAgency.name} is the largest federal employer in ${state.name} with ${formatNumber(topAgency.count)} employees. ${sortedAgencies.length > 1 ? `The second-largest is the ${sortedAgencies[1].name} with ${formatNumber(sortedAgencies[1].count)} employees.` : ""}`
        : `Federal employment in ${state.name} is distributed across ${state.agencies.length} agencies.`,
    },
    {
      q: `What is the highest federal salary in ${state.name}?`,
      a: topEarner
        ? `The highest-paid federal employee in ${state.name} earns ${formatCurrency(topEarner.totalCompensation)} as a ${topEarner.jobTitle} at the ${topEarner.agency}.`
        : `Federal salaries in ${state.name} range widely based on grade level and locality pay. GS-15 employees in high-locality areas can earn over $200,000.`,
    },
    {
      q: `Does locality pay apply in ${state.name}?`,
      a: `Yes. Federal employees in ${state.name} receive locality pay adjustments based on their duty station. Rates vary by metro area — employees in major cities typically receive higher adjustments than those in rural areas. The "Rest of US" rate applies to duty stations outside designated locality pay areas.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Place",
      name: state.name,
      address: {
        "@type": "PostalAddress",
        addressRegion: state.abbreviation,
        addressCountry: "US",
      },
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
          { label: "States", href: "/states" },
          { label: state.name },
        ]}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/20 font-data text-lg font-bold text-accent-blue">
            {state.abbreviation}
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
              {state.name}
            </h1>
            <p className="text-navy-400">Government Employee Salary Data</p>
          </div>
        </div>
        <ShareButton
          title={`${state.name} Government Employee Salaries`}
          text={`Explore salary data for ${formatNumber(state.employeeCount)} government employees in ${state.name}. Average salary: ${formatCurrency(state.averageSalary)}.`}
          url={`/states/${slug}`}
        />
      </div>

      <div className="mt-8">
        <StatsBar
          stats={[
            { label: "Federal Employees", value: formatNumber(state.employeeCount) },
            { label: "Average Salary", value: formatCurrency(state.averageSalary) },
            { label: "Median Salary", value: formatCurrency(state.medianSalary) },
            { label: "Agencies Present", value: String(state.agencies.length) },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Agencies in this state */}
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
              Federal Agencies in {state.name}
            </h2>
            <div className="mt-4 divide-y divide-navy-800">
              {state.agencies
                .sort((a, b) => b.count - a.count)
                .map((agency) => (
                  <Link
                    key={agency.slug}
                    href={`/agencies/${agency.slug}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-accent-blue"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm text-navy-200">
                      <Building2 size={14} className="shrink-0 text-navy-500" />
                      <span className="truncate">{agency.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="whitespace-nowrap font-data text-xs text-navy-400">
                        {formatNumber(agency.count)}
                      </span>
                      <ArrowRight size={12} className="text-navy-600" />
                    </span>
                  </Link>
                ))}
            </div>
          </div>

          {/* Top Earners */}
          {state.topEarners.length > 0 && (
            <div className="mt-6">
              <h2 className="font-heading text-lg font-bold text-navy-100">
                Top Earners in {state.name}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {state.topEarners.map((emp, index) => (
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
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <h3 className="font-heading text-sm font-bold text-navy-100">
              Explore {state.name}
            </h3>
            <div className="mt-3 space-y-2">
              <Link
                href={`/search?state=${slug}`}
                className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
              >
                <Users size={14} />
                Search all {state.name} employees
              </Link>
              <Link
                href="/tools/compare"
                className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
              >
                <ArrowRight size={14} />
                Compare state salaries
              </Link>
              <Link
                href="/tools/cost-of-living"
                className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
              >
                <ArrowRight size={14} />
                Cost of living calculator
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <h3 className="font-heading text-sm font-bold text-navy-100">
              Nearby States
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(() => {
                const abbrevs = STATE_NEIGHBORS[state.abbreviation] ?? [];
                const neighbors = US_STATES.filter(
                  (s) => abbrevs.includes(s.abbreviation) && s.slug !== slug
                );
                return neighbors.length > 0
                  ? neighbors.slice(0, 6)
                  : US_STATES.filter((s) => s.slug !== slug).slice(0, 6);
              })().map((s) => (
                  <Link
                    key={s.slug}
                    href={`/states/${s.slug}`}
                    className="rounded-lg border border-navy-700 bg-navy-800 px-2 py-2 text-center text-xs font-medium text-navy-400 transition-colors hover:border-accent-blue/50 hover:text-accent-blue"
                  >
                    {s.name}
                  </Link>
                ))}
            </div>
          </div>

          <AdSlot slot="rectangle" />
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 divide-y divide-navy-800">
          {faqItems.map((faq) => (
            <details key={faq.q} className="group py-4 first:pt-0 last:pb-0">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-navy-200 group-open:text-accent-blue">
                {faq.q}
                <ArrowRight size={14} className="shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-navy-400">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Guides */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          Related Guides
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link
            href="/insights/federal-locality-pay-explained"
            className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Guide</span>
            <p className="mt-1 font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue">
              Locality Pay Explained
            </p>
            <p className="mt-1 text-xs text-navy-400">How location affects your salary and which areas pay the most.</p>
          </Link>
          <Link
            href="/insights/federal-vs-private-sector-pay"
            className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Guide</span>
            <p className="mt-1 font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue">
              Federal vs. Private Sector Pay
            </p>
            <p className="mt-1 text-xs text-navy-400">Compare total compensation across sectors.</p>
          </Link>
          <Link
            href="/insights/gs-pay-scale-guide-2026"
            className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Guide</span>
            <p className="mt-1 font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue">
              GS Pay Scale Guide 2026
            </p>
            <p className="mt-1 text-xs text-navy-400">Grades, steps, locality adjustments, and salary calculations.</p>
          </Link>
        </div>
      </div>

      {/* Data Source Attribution */}
      <div className="mt-8 border-t border-navy-700 pt-4">
        <p className="text-xs text-navy-500">
          <strong className="text-navy-400">Data Source:</strong>{" "}
          <a
            href="https://www.opm.gov/data/datasets/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:underline"
          >
            U.S. Office of Personnel Management (OPM FedScope)
          </a>{" "}
          | Public records obtained under the Freedom of Information Act (FOIA).
        </p>
      </div>
    </div>
    </>
  );
}
