import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmployeeCard } from "@/components/EmployeeCard";
import { AnimatedBar } from "@/components/AnimatedBar";
import { getEmployeeBySlug, getEmployeesByAgency, getAgencyAvgSalary, getNationalAvgSalary } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { GS_BASE_PAY_2025 } from "@/lib/reference-data";
import { AdSlot } from "@/components/AdSlot";
import { JobsCTA } from "@/components/JobsCTA";
import { ShareButton } from "@/components/ShareButton";
import { Building2, MapPin, Briefcase, Calendar, TrendingUp, ArrowRight } from "lucide-react";

export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Thin records lack critical data — noindex to avoid thin-content penalties at scale. */
function isThinRecord(emp: NonNullable<Awaited<ReturnType<typeof getEmployeeBySlug>>>) {
  return !emp.jobTitle || emp.totalCompensation <= 0 || !emp.dutyStation;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const employee = await getEmployeeBySlug(slug);
  if (!employee) return { title: "Employee Not Found" };

  return {
    title: `${employee.name} — ${employee.jobTitle || "Federal Employee"} at ${employee.agency}`,
    description: `${employee.name} earns ${formatCurrency(employee.totalCompensation)} as a ${employee.jobTitle || "federal employee"} at the ${employee.agency} in ${employee.dutyStation || "the United States"}. View full compensation details.`,
    alternates: { canonical: `https://govpay.directory/employees/${slug}` },
    ...(isThinRecord(employee) && { robots: "noindex, follow" }),
  };
}

export default async function EmployeePage({ params }: PageProps) {
  const { slug } = await params;
  const employee = await getEmployeeBySlug(slug);
  if (!employee) notFound();

  const { employees: agencyEmployees } = await getEmployeesByAgency(employee.agencySlug, 3);
  const relatedEmployees = agencyEmployees.filter((e) => e.id !== employee.id);

  const gradeNum = parseInt(employee.grade);
  const basePay = GS_BASE_PAY_2025[gradeNum];
  const agencyAvg = await getAgencyAvgSalary(employee.agencySlug);
  const nationalAvg = await getNationalAvgSalary();
  const compVsAgency = (
    ((employee.totalCompensation - agencyAvg) / agencyAvg) *
    100
  ).toFixed(1);
  const compVsNational = (
    ((employee.totalCompensation - nationalAvg) / nationalAvg) *
    100
  ).toFixed(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: employee.name,
    jobTitle: employee.jobTitle,
    worksFor: {
      "@type": "GovernmentOrganization",
      name: employee.agency,
    },
    workLocation: {
      "@type": "Place",
      name: employee.dutyStation,
    },
  };

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
            { label: employee.state, href: `/states/${employee.stateSlug}` },
            { label: employee.agency, href: `/agencies/${employee.agencySlug}` },
            { label: employee.name },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
              {employee.name}
            </h1>
            <p className="mt-1 text-lg text-navy-400">{employee.jobTitle}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-navy-400">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-accent-blue" />
                <Link
                  href={`/agencies/${employee.agencySlug}`}
                  className="hover:text-accent-blue"
                >
                  {employee.agency}
                </Link>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-accent-green" />
                <Link
                  href={`/states/${employee.stateSlug}`}
                  className="hover:text-accent-blue"
                >
                  {employee.dutyStation}
                </Link>
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-accent-amber" />
                {employee.payPlan}-{employee.grade}, Step {employee.step}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-navy-500" />
                FY {employee.year}
              </span>
            </div>
          </div>
          <ShareButton
            title={`${employee.name} — ${employee.jobTitle} at ${employee.agency}`}
            text={`${employee.name} earns ${formatCurrency(employee.totalCompensation)} as a ${employee.jobTitle} at ${employee.agency}`}
            url={`/employees/${slug}`}
          />
        </div>

        {/* Compensation Card */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
              <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
                Compensation Details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-navy-800 p-4">
                  <p className="text-xs text-navy-500">Total Compensation</p>
                  <p className="mt-1 font-[family-name:var(--font-data)] text-2xl font-bold text-accent-green sm:text-3xl">
                    {formatCurrency(employee.totalCompensation)}
                  </p>
                  <p className="mt-1 text-xs text-navy-500">
                    Including locality adjustment
                  </p>
                </div>
                <div className="rounded-lg bg-navy-800 p-4">
                  <p className="text-xs text-navy-500">Base Salary</p>
                  <p className="mt-1 font-[family-name:var(--font-data)] text-2xl font-bold text-navy-100 sm:text-3xl">
                    {formatCurrency(employee.baseSalary)}
                  </p>
                  <p className="mt-1 text-xs text-navy-500">
                    {employee.payPlan}-{employee.grade}, Step {employee.step}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-navy-800 p-4">
                  <p className="text-xs text-navy-500">Pay Plan</p>
                  <p className="mt-1 font-[family-name:var(--font-data)] text-lg font-bold text-navy-100">
                    {employee.payPlan}
                  </p>
                </div>
                <div className="rounded-lg bg-navy-800 p-4">
                  <p className="text-xs text-navy-500">Grade / Step</p>
                  <p className="mt-1 font-[family-name:var(--font-data)] text-lg font-bold text-navy-100">
                    {employee.grade} / {employee.step}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-navy-800 p-4 sm:col-span-1">
                  <p className="text-xs text-navy-500">Occupation</p>
                  <p className="mt-1 font-[family-name:var(--font-data)] text-lg font-bold text-navy-100">
                    {employee.occupationCode}
                  </p>
                  <p className="truncate text-xs text-navy-500">
                    {employee.occupationTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Context narrative */}
            <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
              <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
                Compensation Context
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-navy-300">
                <p>
                  {employee.name} serves as a {employee.jobTitle} at the{" "}
                  {employee.agency}, stationed in {employee.dutyStation}. With a
                  total compensation of{" "}
                  {formatCurrency(employee.totalCompensation)}, this salary is{" "}
                  <span
                    className={
                      parseFloat(compVsAgency) > 0
                        ? "text-accent-green"
                        : "text-accent-red"
                    }
                  >
                    {parseFloat(compVsAgency) > 0 ? "+" : ""}
                    {compVsAgency}%
                  </span>{" "}
                  compared to the agency average of{" "}
                  {formatCurrency(agencyAvg)} and{" "}
                  <span
                    className={
                      parseFloat(compVsNational) > 0
                        ? "text-accent-green"
                        : "text-accent-red"
                    }
                  >
                    {parseFloat(compVsNational) > 0 ? "+" : ""}
                    {compVsNational}%
                  </span>{" "}
                  compared to the national federal average of{" "}
                  {formatCurrency(nationalAvg)}.
                </p>
                <p>
                  The position is classified under the {employee.payPlan} pay
                  plan at grade {employee.grade}, step {employee.step}. The base
                  salary of {formatCurrency(employee.baseSalary)} is adjusted by
                  the locality pay rate for the {employee.dutyStation} area,
                  resulting in the total compensation shown above.
                </p>
                {basePay && (
                  <p>
                    Under the GS pay scale, grade {employee.grade} salaries
                    range from {formatCurrency(basePay[0])} (Step 1) to{" "}
                    {formatCurrency(basePay[9])} (Step 10) before locality
                    adjustments.{" "}
                    <Link
                      href={`/pay-scales/gs/${employee.grade}`}
                      className="text-accent-blue hover:underline"
                    >
                      View the full GS-{employee.grade} pay table
                      <ArrowRight size={12} className="ml-1 inline" />
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                How This Salary Compares
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-400">vs. Agency Average</span>
                    <span
                      className={`font-[family-name:var(--font-data)] font-bold ${parseFloat(compVsAgency) > 0 ? "text-accent-green" : "text-accent-red"}`}
                    >
                      {parseFloat(compVsAgency) > 0 ? "+" : ""}
                      {compVsAgency}%
                    </span>
                  </div>
                  <AnimatedBar
                    percentage={Math.min(100, Math.max(10, 50 + parseFloat(compVsAgency)))}
                    colorClass="bg-accent-blue"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-400">vs. National Average</span>
                    <span
                      className={`font-[family-name:var(--font-data)] font-bold ${parseFloat(compVsNational) > 0 ? "text-accent-green" : "text-accent-red"}`}
                    >
                      {parseFloat(compVsNational) > 0 ? "+" : ""}
                      {compVsNational}%
                    </span>
                  </div>
                  <AnimatedBar
                    percentage={Math.min(100, Math.max(10, 50 + parseFloat(compVsNational)))}
                    colorClass="bg-accent-green"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                Quick Links
              </h3>
              <div className="mt-3 space-y-2">
                <Link
                  href={`/agencies/${employee.agencySlug}`}
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <Building2 size={14} />
                  All {employee.agency} employees
                </Link>
                <Link
                  href={`/states/${employee.stateSlug}`}
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <MapPin size={14} />
                  Federal employees in {employee.state}
                </Link>
                {employee.payPlan === "GS" && (
                  <Link
                    href={`/pay-scales/gs/${employee.grade}`}
                    className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                  >
                    <TrendingUp size={14} />
                    GS-{employee.grade} pay scale
                  </Link>
                )}
                <Link
                  href={`/tools/compare`}
                  className="flex items-center gap-2 text-sm text-navy-400 hover:text-accent-blue"
                >
                  <TrendingUp size={14} />
                  Compare this salary
                </Link>
              </div>
            </div>

            <JobsCTA
              agencyName={employee.agency}
              keyword={employee.jobTitle}
            />

            <AdSlot slot="rectangle" />
          </div>
        </div>

        {/* Related Employees */}
        {relatedEmployees.length > 0 && (
          <div className="mt-12">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
              More at {employee.agency}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedEmployees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} />
              ))}
            </div>
          </div>
        )}

        {/* Related Guides — drives pageviews to editorial content */}
        {employee.payPlan === "GS" && (
          <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
              Related Guides
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/insights/gs-pay-scale-guide-2025"
                className="rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-navy-300 transition-all hover:border-accent-blue/50 hover:text-accent-blue"
              >
                <ArrowRight size={12} className="mr-1 inline text-accent-blue" />
                Complete GS Pay Scale Guide
              </Link>
              <Link
                href="/insights/federal-employee-step-increases"
                className="rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-navy-300 transition-all hover:border-accent-blue/50 hover:text-accent-blue"
              >
                <ArrowRight size={12} className="mr-1 inline text-accent-blue" />
                How Step Increases Work
              </Link>
              <Link
                href="/insights/federal-locality-pay-explained"
                className="rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-navy-300 transition-all hover:border-accent-blue/50 hover:text-accent-blue"
              >
                <ArrowRight size={12} className="mr-1 inline text-accent-blue" />
                Locality Pay Explained
              </Link>
            </div>
          </div>
        )}

        {/* Public Records Notice + Source */}
        <div className="mt-8 rounded-lg border border-navy-700 bg-navy-900/50 p-4">
          <p className="text-xs leading-relaxed text-navy-500">
            <strong className="text-navy-400">Public Records Notice:</strong>{" "}
            This compensation data is a public record obtained from the{" "}
            <a
              href="https://www.opm.gov/data/datasets/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:underline"
            >
              U.S. Office of Personnel Management (OPM)
            </a>{" "}
            under the Freedom of Information Act (FOIA). Federal employee salary
            information is published as part of government transparency
            requirements. Data reflects FY {employee.year} compensation records.
            If you believe any information is inaccurate, please{" "}
            <a
              href="mailto:info@alstonanalytics.com?subject=Data%20Correction%20Request"
              className="text-accent-blue hover:underline"
            >
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
