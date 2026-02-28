import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GS_BASE_PAY_2025 } from "@/lib/reference-data";
import { formatCurrency } from "@/lib/format";
import { ArrowRight, Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Federal Pay Scales",
  description:
    "Browse federal pay scales including the General Schedule (GS) system. Compare grades, steps, and locality adjustments for government employees.",
  alternates: { canonical: "https://govpay.directory/pay-scales" },
};

export default function PayScalesIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Pay Scales" }]}
      />

      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
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
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100 group-hover:text-accent-blue">
              General Schedule (GS)
            </h2>
          </div>
          <p className="mt-3 text-sm text-navy-400">
            The primary pay scale for federal civilian employees. 15 grades with
            10 steps each, adjusted for over 50 locality areas.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-navy-800 p-2">
              <p className="font-[family-name:var(--font-data)] text-xs font-bold text-accent-green">
                {formatCurrency(GS_BASE_PAY_2025[1][0])}
              </p>
              <p className="text-[10px] text-navy-500">GS-1 Min</p>
            </div>
            <div className="rounded-lg bg-navy-800 p-2">
              <p className="font-[family-name:var(--font-data)] text-xs font-bold text-accent-green">
                {formatCurrency(GS_BASE_PAY_2025[12][4])}
              </p>
              <p className="text-[10px] text-navy-500">GS-12 Mid</p>
            </div>
            <div className="rounded-lg bg-navy-800 p-2">
              <p className="font-[family-name:var(--font-data)] text-xs font-bold text-accent-green">
                {formatCurrency(GS_BASE_PAY_2025[15][9])}
              </p>
              <p className="text-[10px] text-navy-500">GS-15 Max</p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent-blue">
            View GS pay table <ArrowRight size={14} />
          </span>
        </Link>

        {/* SES - Coming Soon */}
        <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-6">
          <div className="flex items-center gap-3">
            <Calculator size={20} className="text-navy-600" />
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-500">
              Senior Executive Service (SES)
            </h2>
          </div>
          <p className="mt-3 text-sm text-navy-500">
            Pay rates for senior-level federal executives and managers. Covers
            ES-1 through ES-6 positions.
          </p>
          <span className="mt-4 inline-block rounded-full border border-navy-700 px-3 py-1 text-xs text-navy-500">
            Coming soon
          </span>
        </div>

        {/* LEO - Coming Soon */}
        <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-6">
          <div className="flex items-center gap-3">
            <Calculator size={20} className="text-navy-600" />
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-500">
              Law Enforcement Officer (LEO)
            </h2>
          </div>
          <p className="mt-3 text-sm text-navy-500">
            Special pay rates for federal law enforcement positions including
            availability pay and LEAP adjustments.
          </p>
          <span className="mt-4 inline-block rounded-full border border-navy-700 px-3 py-1 text-xs text-navy-500">
            Coming soon
          </span>
        </div>
      </div>

      {/* Related Guides */}
      <div className="mt-12">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
          Related Guides
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Complete GS Pay Scale Guide",
              href: "/insights/gs-pay-scale-guide-2025",
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
              <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100 group-hover:text-accent-blue">
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
  );
}
