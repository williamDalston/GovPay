import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GS_BASE_PAY_2026 } from "@/lib/reference-data";
import { formatCurrency } from "@/lib/format";
import { ArrowRight, Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Federal Pay Scales",
  description:
    "Browse federal pay scales including the General Schedule (GS) system. Compare grades, steps, and locality adjustments for government employees.",
  alternates: { canonical: "https://www.govpay.directory/pay-scales" },
};

export default function PayScalesIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Federal Pay Scales",
    description:
      "Browse federal pay scales including the General Schedule (GS) system. Compare grades, steps, and locality adjustments for government employees.",
    url: "https://www.govpay.directory/pay-scales",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: 1,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "General Schedule (GS) Pay Scale 2026",
          url: "https://www.govpay.directory/pay-scales/gs",
        },
      ],
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
        items={[{ label: "Home", href: "/" }, { label: "Pay Scales" }]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Federal Pay Scales
      </h1>
      <p className="mt-2 text-navy-400">
        Explore federal government pay systems with interactive tables and
        locality adjustments.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* GS Pay Scale */}
        <Link
          href="/pay-scales/gs"
          className="group rounded-xl border border-navy-700 bg-navy-900 p-6 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5"
        >
          <div className="flex items-center gap-3">
            <Calculator size={20} className="text-accent-blue" />
            <h2 className="font-heading text-lg font-bold text-navy-100 group-hover:text-accent-blue">
              General Schedule (GS)
            </h2>
          </div>
          <p className="mt-3 text-sm text-navy-400">
            The primary pay scale for federal civilian employees. 15 grades with
            10 steps each, adjusted for over 50 locality areas.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-navy-800 p-2">
              <p className="font-data text-xs font-bold text-accent-green">
                {formatCurrency(GS_BASE_PAY_2026[1][0])}
              </p>
              <p className="text-[10px] text-navy-500">GS-1 Min</p>
            </div>
            <div className="rounded-lg bg-navy-800 p-2">
              <p className="font-data text-xs font-bold text-accent-green">
                {formatCurrency(GS_BASE_PAY_2026[12][4])}
              </p>
              <p className="text-[10px] text-navy-500">GS-12 Mid</p>
            </div>
            <div className="rounded-lg bg-navy-800 p-2">
              <p className="font-data text-xs font-bold text-accent-green">
                {formatCurrency(GS_BASE_PAY_2026[15][9])}
              </p>
              <p className="text-[10px] text-navy-500">GS-15 Max</p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent-blue">
            View GS pay table <ArrowRight size={14} />
          </span>
        </Link>

        {/* SES */}
        <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-6">
          <div className="flex items-center gap-3">
            <Calculator size={20} className="text-navy-600" />
            <h2 className="font-heading text-lg font-bold text-navy-500">
              Senior Executive Service (SES)
            </h2>
          </div>
          <p className="mt-3 text-sm text-navy-400">
            The SES covers top-level career executives who serve just below
            presidential appointees. Pay ranges from approximately $145,000 to
            $230,000 depending on agency certification. SES members lead
            bureaus, direct programs, and develop policy at the highest levels
            of government.
          </p>
          <span className="mt-4 inline-block rounded-full border border-navy-700 px-3 py-1 text-xs text-navy-500">
            Interactive table coming soon
          </span>
        </div>

        {/* WG / LEO */}
        <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-6">
          <div className="flex items-center gap-3">
            <Calculator size={20} className="text-navy-600" />
            <h2 className="font-heading text-lg font-bold text-navy-500">
              Federal Wage System (WG/WL/WS)
            </h2>
          </div>
          <p className="mt-3 text-sm text-navy-400">
            The Federal Wage System covers blue-collar and trade positions
            (mechanics, electricians, warehouse workers). Rates are based on
            local prevailing wages rather than a national table. Grades range
            from WG-1 to WG-15 with separate scales for leaders (WL) and
            supervisors (WS).
          </p>
          <span className="mt-4 inline-block rounded-full border border-navy-700 px-3 py-1 text-xs text-navy-500">
            Interactive table coming soon
          </span>
        </div>
      </div>

      {/* Understanding Pay Systems */}
      <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
          Understanding Federal Pay Systems
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-navy-300">
          <p>
            The federal government uses multiple pay systems to compensate its
            workforce. The <strong className="text-navy-200">General Schedule (GS)</strong> is
            the largest, covering approximately 1.5 million white-collar employees.
            The <strong className="text-navy-200">Federal Wage System (WG/WL/WS)</strong>{" "}
            covers roughly 250,000 blue-collar and trade workers. The{" "}
            <strong className="text-navy-200">Senior Executive Service (SES)</strong> covers
            about 8,000 top career executives.
          </p>
          <p>
            The key differences between these systems affect how pay is
            calculated, how employees advance, and what career options are
            available. GS employees follow a national pay table adjusted for
            locality; WG employees are paid based on local prevailing wage
            surveys; SES members negotiate pay within a broad band.
          </p>
        </div>
        <div className="mt-4 -mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[500px]" aria-label="Comparison of federal pay systems">
            <thead>
              <tr className="border-b border-navy-700 text-left text-xs text-navy-500">
                <th className="pb-2 font-medium">Pay System</th>
                <th className="pb-2 font-medium">Grades</th>
                <th className="pb-2 font-medium">Typical Roles</th>
                <th className="pb-2 text-right font-medium">Salary Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-sm">
              <tr className="transition-colors hover:bg-navy-800/50">
                <td className="py-2.5 font-medium text-navy-200">General Schedule (GS)</td>
                <td className="py-2.5 text-navy-400">GS-1 to GS-15</td>
                <td className="py-2.5 text-navy-400">Analysts, IT specialists, attorneys, engineers</td>
                <td className="whitespace-nowrap py-2.5 text-right font-data text-navy-300">$21,986 – $230,074*</td>
              </tr>
              <tr className="transition-colors hover:bg-navy-800/50">
                <td className="py-2.5 font-medium text-navy-200">Senior Executive Service</td>
                <td className="py-2.5 text-navy-400">ES-1 to ES-6</td>
                <td className="py-2.5 text-navy-400">Bureau chiefs, program directors, policy executives</td>
                <td className="whitespace-nowrap py-2.5 text-right font-data text-navy-300">$145,000 – $230,700</td>
              </tr>
              <tr className="transition-colors hover:bg-navy-800/50">
                <td className="py-2.5 font-medium text-navy-200">Federal Wage System</td>
                <td className="py-2.5 text-navy-400">WG-1 to WG-15</td>
                <td className="py-2.5 text-navy-400">Mechanics, electricians, warehouse workers</td>
                <td className="whitespace-nowrap py-2.5 text-right font-data text-navy-300">Varies by locality</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-navy-500">* GS range includes highest locality adjustment (San Francisco, +44.72%)</p>
        </div>
      </div>

      {/* Related Guides */}
      <div className="mt-12">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          Related Guides
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Complete GS Pay Scale Guide",
              href: "/insights/gs-pay-scale-guide-2026",
              desc: "Grades, steps, and how to calculate your salary.",
            },
            {
              title: "Locality Pay Explained",
              href: "/insights/federal-locality-pay-explained",
              desc: "How your work location affects total compensation.",
            },
            {
              title: "How Step Increases Work",
              href: "/insights/federal-employee-step-increases",
              desc: "Waiting periods, eligibility, and faster progression.",
            },
          ].map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
            >
              <p className="font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue">
                {guide.title}
              </p>
              <p className="mt-1 text-xs text-navy-400">{guide.desc}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-accent-blue">
                Read guide <ArrowRight size={10} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
