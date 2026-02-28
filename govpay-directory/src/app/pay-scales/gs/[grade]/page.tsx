import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmployeeCard } from "@/components/EmployeeCard";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { getEmployeesByGrade } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { GS_BASE_PAY_2026, GS_GRADES, GS_STEPS, LOCALITY_AREAS, GRADE_CONTEXT } from "@/lib/reference-data";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ grade: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { grade } = await params;
  const gradeNum = parseInt(grade);
  if (!GS_BASE_PAY_2026[gradeNum]) return { title: "Grade Not Found" };

  const basePay = GS_BASE_PAY_2026[gradeNum];
  return {
    title: `GS-${gradeNum} Pay Scale 2026 — ${formatCurrency(basePay[0])} to ${formatCurrency(basePay[9])}`,
    description: `GS-${gradeNum} federal pay scale for 2026. Step 1: ${formatCurrency(basePay[0])}. Step 10: ${formatCurrency(basePay[9])}. View locality-adjusted rates and employees at this grade.`,
    alternates: {
      canonical: `https://www.govpay.directory/pay-scales/gs/${gradeNum}`,
    },
  };
}

export async function generateStaticParams() {
  return GS_GRADES.map((g) => ({ grade: String(g) }));
}

export default async function GSGradePage({ params }: PageProps) {
  const { grade } = await params;
  const gradeNum = parseInt(grade);
  const basePay = GS_BASE_PAY_2026[gradeNum];
  if (!basePay) notFound();

  const employeesAtGrade = await getEmployeesByGrade(grade, 6);

  const prevGrade = gradeNum > 1 ? gradeNum - 1 : null;
  const nextGrade = gradeNum < 15 ? gradeNum + 1 : null;

  const ctx = GRADE_CONTEXT[gradeNum];
  const dcAdj = LOCALITY_AREAS.find((a) => a.slug === "washington-dc")?.adjustment ?? 1;
  const prevBasePay = prevGrade ? GS_BASE_PAY_2026[prevGrade] : null;
  const diffFromPrev = prevBasePay ? basePay[0] - prevBasePay[0] : null;

  const faqItems = [
    {
      q: `What is the GS-${gradeNum} salary in 2026?`,
      a: `The GS-${gradeNum} base salary ranges from ${formatCurrency(basePay[0])} (Step 1) to ${formatCurrency(basePay[9])} (Step 10) before locality adjustments.`,
    },
    {
      q: `How much does a GS-${gradeNum} make with locality pay?`,
      a: `With locality adjustments, GS-${gradeNum} salaries can range significantly. In Washington, DC, a GS-${gradeNum} Step 1 earns approximately ${formatCurrency(Math.round(basePay[0] * dcAdj))}. In San Francisco, that figure rises to ${formatCurrency(Math.round(basePay[0] * 1.4472))}.`,
    },
    {
      q: `What jobs are GS-${gradeNum}?`,
      a: `Typical GS-${gradeNum} positions include ${ctx.typicalJobs.join(", ")}. GS-${gradeNum} is classified as ${ctx.level} in the federal pay system.`,
    },
    {
      q: `How long does it take to reach GS-${gradeNum} Step 10?`,
      a: `It takes 18 years of continuous satisfactory performance to advance from Step 1 to Step 10 within GS-${gradeNum}. Steps 1-4 advance annually, Steps 4-7 every two years, and Steps 7-10 every three years. At Step 10, you would earn ${formatCurrency(basePay[9])} in base pay.`,
    },
    ...(prevBasePay
      ? [
          {
            q: `How much more does GS-${gradeNum} pay than GS-${prevGrade}?`,
            a: `GS-${gradeNum} Step 1 (${formatCurrency(basePay[0])}) pays ${formatCurrency(diffFromPrev!)} more than GS-${prevGrade} Step 1 (${formatCurrency(prevBasePay[0])}), a ${((diffFromPrev! / prevBasePay[0]) * 100).toFixed(1)}% increase before locality adjustments.`,
          },
        ]
      : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
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

        <h1 className="mt-4 font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
          GS-{gradeNum} Pay Scale 2026
        </h1>
        <p className="mt-2 text-navy-400">
          Base salary: {formatCurrency(basePay[0])} (Step 1) to{" "}
          {formatCurrency(basePay[9])} (Step 10)
        </p>

        {/* Base Pay Table */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            Base Pay by Step
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:grid-cols-5 lg:grid-cols-10">
            {GS_STEPS.map((step) => (
              <div
                key={step}
                className="rounded-lg bg-navy-800 px-2 py-3 text-center sm:px-3"
              >
                <p className="text-[11px] text-navy-500 sm:text-xs">Step {step}</p>
                <p className="mt-1 font-data text-xs font-bold text-navy-100 sm:text-sm">
                  {formatCurrency(basePay[step - 1])}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Locality Adjustments */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            Locality-Adjusted Pay (Step 1 & Step 10)
          </h2>
          <p className="mt-2 text-xs text-navy-500 sm:hidden">Swipe to see all columns &rarr;</p>
          <div className="-mx-6 mt-2 overflow-x-auto px-6 sm:mt-4">
            <table className="w-full min-w-[500px]" aria-label={`GS-${gradeNum} locality-adjusted pay rates`}>
              <thead>
                <tr className="border-b border-navy-700 text-left text-xs text-navy-500">
                  <th className="pb-2 font-medium">Locality Area</th>
                  <th className="whitespace-nowrap pb-2 text-right font-medium">Adjustment</th>
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
                    <td className="whitespace-nowrap py-2.5 text-right font-data text-xs text-navy-400">
                      {area.adjustment === 1.0
                        ? "Base"
                        : `+${((area.adjustment - 1) * 100).toFixed(1)}%`}
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right font-data text-xs text-navy-100 sm:text-sm">
                      {formatCurrency(Math.round(basePay[0] * area.adjustment))}
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right font-data text-xs text-accent-green sm:text-sm">
                      {formatCurrency(Math.round(basePay[9] * area.adjustment))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Typical Jobs */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            Typical Jobs at GS-{gradeNum}
          </h2>
          <p className="mt-2 text-xs text-navy-500">{ctx.level}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ctx.typicalJobs.map((job) => (
              <span
                key={job}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-1.5 text-sm text-navy-200"
              >
                <Briefcase size={12} className="text-navy-500" />
                {job}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-navy-400">
            GS-{gradeNum} positions are classified as <strong className="text-navy-300">{ctx.level}</strong> in
            the federal workforce. {gradeNum <= 7
              ? "These roles typically require a high school diploma or bachelor's degree, depending on the series."
              : gradeNum <= 11
                ? "These positions usually require a bachelor's or master's degree, or equivalent professional experience."
                : gradeNum <= 13
                  ? "Candidates typically need extensive specialized experience, an advanced degree, or both."
                  : "These are leadership and senior expert positions that require deep expertise and significant management experience."}
          </p>
        </div>

        {/* Career Path */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            Career Path
          </h2>
          <div className="mt-4 flex items-center gap-4">
            {prevGrade && prevBasePay && (
              <Link
                href={`/pay-scales/gs/${prevGrade}`}
                className="flex-1 rounded-lg border border-navy-700 p-3 text-center transition-colors hover:border-accent-blue/50 hover:bg-navy-800"
              >
                <p className="text-xs text-navy-500">From</p>
                <p className="mt-1 font-heading text-sm font-bold text-navy-200">GS-{prevGrade}</p>
                <p className="mt-0.5 font-data text-xs text-navy-400">{formatCurrency(prevBasePay[0])}</p>
                <p className="mt-1 text-[11px] text-navy-500">{ctx.timeFromPrev}</p>
              </Link>
            )}
            <div className="flex-1 rounded-lg border border-accent-blue/30 bg-accent-blue/5 p-3 text-center">
              <p className="text-xs text-accent-blue">Current</p>
              <p className="mt-1 font-heading text-sm font-bold text-navy-100">GS-{gradeNum}</p>
              <p className="mt-0.5 font-data text-xs text-accent-green">{formatCurrency(basePay[0])}</p>
              <p className="mt-1 text-[11px] text-navy-400">{ctx.level}</p>
            </div>
            {nextGrade && (
              <Link
                href={`/pay-scales/gs/${nextGrade}`}
                className="flex-1 rounded-lg border border-navy-700 p-3 text-center transition-colors hover:border-accent-blue/50 hover:bg-navy-800"
              >
                <p className="text-xs text-navy-500">To</p>
                <p className="mt-1 font-heading text-sm font-bold text-navy-200">GS-{nextGrade}</p>
                <p className="mt-0.5 font-data text-xs text-navy-400">{formatCurrency(GS_BASE_PAY_2026[nextGrade][0])}</p>
                <p className="mt-1 text-[11px] text-navy-500">{ctx.timeToNext}</p>
              </Link>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-400">
            Within GS-{gradeNum}, it takes <strong className="text-navy-300">18 years</strong> to progress from
            Step 1 ({formatCurrency(basePay[0])}) to Step 10 ({formatCurrency(basePay[9])}) — a cumulative increase
            of {formatCurrency(basePay[9] - basePay[0])} ({((basePay[9] / basePay[0] - 1) * 100).toFixed(1)}%).
            Steps 1-4 advance annually, Steps 4-7 every two years, and Steps 7-10 every three years.
          </p>
        </div>

        {/* Employees at this grade */}
        {employeesAtGrade.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg font-bold text-navy-100">
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
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
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

        {/* FAQ */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
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
      </div>
    </>
  );
}
