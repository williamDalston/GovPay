import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmployeeCard } from "@/components/EmployeeCard";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { getEmployeesByGrade } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { GS_BASE_PAY_2025, GS_GRADES, GS_STEPS, LOCALITY_AREAS } from "@/lib/reference-data";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ grade: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { grade } = await params;
  const gradeNum = parseInt(grade);
  if (!GS_BASE_PAY_2025[gradeNum]) return { title: "Grade Not Found" };

  const basePay = GS_BASE_PAY_2025[gradeNum];
  return {
    title: `GS-${gradeNum} Pay Scale 2025 — ${formatCurrency(basePay[0])} to ${formatCurrency(basePay[9])}`,
    description: `GS-${gradeNum} federal pay scale for 2025. Step 1: ${formatCurrency(basePay[0])}. Step 10: ${formatCurrency(basePay[9])}. View locality-adjusted rates and employees at this grade.`,
    alternates: {
      canonical: `/pay-scales/gs/${gradeNum}`,
    },
  };
}

export async function generateStaticParams() {
  return GS_GRADES.map((g) => ({ grade: String(g) }));
}

export default async function GSGradePage({ params }: PageProps) {
  const { grade } = await params;
  const gradeNum = parseInt(grade);
  const basePay = GS_BASE_PAY_2025[gradeNum];
  if (!basePay) notFound();

  const employeesAtGrade = await getEmployeesByGrade(grade, 6);

  const prevGrade = gradeNum > 1 ? gradeNum - 1 : null;
  const nextGrade = gradeNum < 15 ? gradeNum + 1 : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the GS-${gradeNum} salary in 2025?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The GS-${gradeNum} base salary ranges from ${formatCurrency(basePay[0])} (Step 1) to ${formatCurrency(basePay[9])} (Step 10) before locality adjustments.`,
        },
      },
      {
        "@type": "Question",
        name: `How much does a GS-${gradeNum} make with locality pay?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `With locality adjustments, GS-${gradeNum} salaries can range significantly. In Washington, DC, a GS-${gradeNum} Step 1 earns approximately ${formatCurrency(Math.round(basePay[0] * 1.3275))}.`,
        },
      },
    ],
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
            { label: "Pay Scales", href: "/pay-scales" },
            { label: "GS Pay Scale", href: "/pay-scales/gs" },
            { label: `GS-${gradeNum}` },
          ]}
        />

        {/* Navigation between grades */}
        <div className="flex items-center justify-between">
          <div>
            {prevGrade && (
              <Link
                href={`/pay-scales/gs/${prevGrade}`}
                className="flex items-center gap-1 text-sm text-navy-400 hover:text-accent-blue"
              >
                <ArrowLeft size={14} /> GS-{prevGrade}
              </Link>
            )}
          </div>
          <div>
            {nextGrade && (
              <Link
                href={`/pay-scales/gs/${nextGrade}`}
                className="flex items-center gap-1 text-sm text-navy-400 hover:text-accent-blue"
              >
                GS-{nextGrade} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
          GS-{gradeNum} Pay Scale 2025
        </h1>
        <p className="mt-2 text-navy-400">
          Base salary: {formatCurrency(basePay[0])} (Step 1) to{" "}
          {formatCurrency(basePay[9])} (Step 10)
        </p>

        {/* Base Pay Table */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
            Base Pay by Step
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:grid-cols-5 lg:grid-cols-10">
            {GS_STEPS.map((step) => (
              <div
                key={step}
                className="rounded-lg bg-navy-800 px-2 py-3 text-center sm:px-3"
              >
                <p className="text-[11px] text-navy-500 sm:text-xs">Step {step}</p>
                <p className="mt-1 font-[family-name:var(--font-data)] text-xs font-bold text-navy-100 sm:text-sm">
                  {formatCurrency(basePay[step - 1])}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Locality Adjustments */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
            Locality-Adjusted Pay (Step 1 & Step 10)
          </h2>
          <div className="-mx-6 mt-4 overflow-x-auto px-6">
            <table className="w-full min-w-[500px]" aria-label={`GS-${gradeNum} locality-adjusted pay rates`}>
              <thead>
                <tr className="border-b border-navy-700 text-left text-xs text-navy-500">
                  <th className="pb-2 font-medium">Locality Area</th>
                  <th className="whitespace-nowrap pb-2 text-right font-medium">Adj.</th>
                  <th className="whitespace-nowrap pb-2 text-right font-medium">Step 1</th>
                  <th className="whitespace-nowrap pb-2 text-right font-medium">Step 10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {LOCALITY_AREAS.map((area) => (
                  <tr key={area.slug} className="text-sm transition-colors hover:bg-navy-800/50">
                    <td className="max-w-[180px] truncate py-2.5 text-navy-200 sm:max-w-none sm:whitespace-normal">
                      {area.area}
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right font-[family-name:var(--font-data)] text-xs text-navy-400">
                      {area.adjustment === 1.0
                        ? "Base"
                        : `+${((area.adjustment - 1) * 100).toFixed(1)}%`}
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right font-[family-name:var(--font-data)] text-xs text-navy-100 sm:text-sm">
                      {formatCurrency(Math.round(basePay[0] * area.adjustment))}
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right font-[family-name:var(--font-data)] text-xs text-accent-green sm:text-sm">
                      {formatCurrency(Math.round(basePay[9] * area.adjustment))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employees at this grade */}
        {employeesAtGrade.length > 0 && (
          <div className="mt-8">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
              Federal Employees at GS-{gradeNum}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {employeesAtGrade.map((emp, index) => (
                <AnimateOnScroll key={emp.id} delay={index * 60}>
                  <EmployeeCard employee={emp} />
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        )}

        {/* About this grade */}
        <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider text-navy-400">
            About GS-{gradeNum}
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-navy-300">
            <p>
              The GS-{gradeNum} grade level is part of the General Schedule pay
              system used by the federal government. This grade typically
              corresponds to{" "}
              {gradeNum <= 4
                ? "entry-level positions requiring limited experience"
                : gradeNum <= 7
                  ? "positions requiring some specialized experience or education"
                  : gradeNum <= 11
                    ? "mid-level positions requiring significant experience or a graduate degree"
                    : gradeNum <= 13
                      ? "senior-level positions requiring extensive experience and expertise"
                      : "executive-level positions with leadership and policy responsibilities"}
              .
            </p>
            <p>
              Employees at GS-{gradeNum} earn a base salary between{" "}
              {formatCurrency(basePay[0])} and {formatCurrency(basePay[9])},
              with locality pay adjustments increasing total compensation by
              up to 44.7% in the highest-cost areas.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
