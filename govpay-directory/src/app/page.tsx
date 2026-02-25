import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { EmployeeCard } from "@/components/EmployeeCard";
import { GlobalStatsBar } from "@/components/StatsBar";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { getAgencies, getTopEarners, getGlobalStats } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/format";
import { US_STATES } from "@/lib/reference-data";
import {
  Building2,
  MapPin,
  TrendingUp,
  Calculator,
  ArrowRight,
  Users,
} from "lucide-react";

export const revalidate = 3600;

export default async function Home() {
  const [agencies, topEarners, stats] = await Promise.all([
    getAgencies(),
    getTopEarners(6),
    getGlobalStats(),
  ]);

  const employeeLabel = stats.totalEmployees > 0
    ? formatNumber(stats.totalEmployees)
    : "2 million+";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "GovPay.Directory",
      url: "https://govpay.directory",
      description: `Search and compare compensation data for ${employeeLabel} federal, state, and local government employees.`,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://govpay.directory/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "GovPay.Directory",
      url: "https://govpay.directory",
      logo: "https://govpay.directory/opengraph-image",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent-blue)_0%,_transparent_50%)] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="animate-fade-in-up font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-navy-100 sm:text-4xl md:text-5xl">
              Explore Public Employee
              <br />
              <span className="bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">Salaries Across America</span>
            </h1>
            <p className="animate-fade-in-up stagger-1 mx-auto mt-4 max-w-2xl text-lg text-navy-400">
              Search and compare compensation data for {employeeLabel} federal,
              state, and local government employees. All data is publicly
              available.
            </p>
            <div className="animate-fade-in-up stagger-2 mx-auto mt-8 max-w-2xl">
              <SearchBar size="large" />
            </div>
            <div className="animate-fade-in-up stagger-3 mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-navy-500">
              <span>Popular:</span>
              {[
                "FBI Agent",
                "NASA Engineer",
                "VA Nurse",
                "GS-13 Salary",
                "Border Patrol",
              ].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-navy-400 transition-colors hover:text-accent-blue"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-navy-700 bg-navy-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GlobalStatsBar />
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="border-b border-navy-700 bg-navy-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                title: "Search by State",
                desc: "Browse employees in all 50 states",
                href: "/states",
                color: "text-accent-blue",
              },
              {
                icon: Building2,
                title: "Search by Agency",
                desc: "Explore 450+ federal agencies",
                href: "/agencies",
                color: "text-accent-green",
              },
              {
                icon: Calculator,
                title: "GS Pay Scale",
                desc: "Interactive pay grade tables",
                href: "/pay-scales/gs",
                color: "text-accent-amber",
              },
              {
                icon: TrendingUp,
                title: "Compare Salaries",
                desc: "Side-by-side compensation tool",
                href: "/tools/compare",
                color: "text-accent-red",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5"
              >
                <item.icon size={24} className={item.color} />
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-navy-400">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Agencies */}
      <section className="border-b border-navy-700 bg-navy-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy-100">
              Top Federal Agencies
            </h2>
            <Link
              href="/agencies"
              className="flex items-center gap-1 text-sm text-accent-blue hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agencies.slice(0, 8).map((agency, index) => (
              <AnimateOnScroll key={agency.slug} delay={index * 60}>
              <Link
                href={`/agencies/${agency.slug}`}
                className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5"
              >
                <div className="flex items-center gap-2">
                  {agency.abbreviation && (
                    <span className="rounded bg-navy-700 px-2 py-0.5 font-[family-name:var(--font-data)] text-xs font-bold text-accent-blue">
                      {agency.abbreviation}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-heading)] text-sm font-bold leading-tight text-navy-100 group-hover:text-accent-blue">
                  {agency.name}
                </h3>
                <div className="mt-3 flex items-center justify-between text-xs text-navy-400">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {formatNumber(agency.employeeCount)}
                  </span>
                  <span className="font-[family-name:var(--font-data)] text-accent-green">
                    Avg {formatCurrency(agency.averageSalary)}
                  </span>
                </div>
              </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Top Earners */}
      <section className="border-b border-navy-700 bg-navy-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy-100">
            Highest Paid Federal Employees
          </h2>
          <p className="mt-1 text-sm text-navy-400">
            Top earners across all federal agencies
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topEarners.map((employee, index) => (
              <AnimateOnScroll key={employee.id} delay={index * 60}>
                <EmployeeCard employee={employee} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* States Grid */}
      <section className="bg-navy-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-navy-100">
              Browse by State
            </h2>
            <Link
              href="/states"
              className="flex items-center gap-1 text-sm text-accent-blue hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {US_STATES.slice(0, 24).map((state, index) => (
              <AnimateOnScroll key={state.slug} delay={index * 30}>
                <Link
                  href={`/states/${state.slug}`}
                  className="block rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-center text-xs text-navy-300 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:text-accent-blue hover:shadow-lg hover:shadow-accent-blue/5"
                >
                  <span className="font-[family-name:var(--font-data)] text-sm font-bold">
                    {state.abbreviation}
                  </span>
                  <br />
                  <span className="text-navy-500">{state.name}</span>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
