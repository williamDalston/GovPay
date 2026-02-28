import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { ArrowRight } from "lucide-react";
import CostOfLivingClient from "./CostOfLivingClient";

export const metadata: Metadata = {
  title: "Cost of Living Salary Adjuster — Federal Pay Calculator",
  description:
    "Calculate what your federal salary is worth in different cities. Compare cost of living adjustments across major metro areas.",
  alternates: { canonical: "https://govpay.directory/tools/cost-of-living" },
};

export default function CostOfLivingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools" },
          { label: "Cost of Living Calculator" },
        ]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Cost of Living Salary Adjuster
      </h1>
      <p className="mt-2 text-navy-400">
        See how far your federal salary goes in different cities across the
        country.
      </p>

      <CostOfLivingClient />

      <div className="mt-8"><AdSlot slot="leaderboard" /></div>

      {/* Info */}
      <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
          About This Tool
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-navy-300">
          This calculator adjusts your federal salary based on cost-of-living
          differences between metro areas. Each city is assigned a cost-of-living
          index (100 = national average). Cities with higher indices are more
          expensive, meaning your salary buys less. Use this tool to understand
          how a geographic move or reassignment would affect your purchasing
          power — even if your GS grade stays the same.
        </p>
      </div>

      {/* Related Guides */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          Related Guides
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Federal Locality Pay Explained", href: "/insights/federal-locality-pay-explained", desc: "How your work location affects total compensation." },
            { title: "GS Pay Scale Guide 2026", href: "/insights/gs-pay-scale-guide-2026", desc: "Grades, steps, and how to calculate your salary." },
            { title: "How Step Increases Work", href: "/insights/federal-employee-step-increases", desc: "Waiting periods, eligibility, and faster progression." },
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
  );
}
