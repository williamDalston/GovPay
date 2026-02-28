import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { ArrowRight } from "lucide-react";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "GS Salary Comparison Tool — Compare Federal Pay Grades",
  description:
    "Compare two GS pay positions side by side. See how grade, step, and locality adjustments affect federal employee salaries.",
  alternates: { canonical: "https://govpay.directory/tools/compare" },
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools" },
          { label: "Salary Comparison" },
        ]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Salary Comparison Tool
      </h1>
      <p className="mt-2 text-navy-400">
        Compare GS pay grades side by side with locality adjustments.
      </p>

      <CompareClient />

      <div className="mt-8"><AdSlot slot="leaderboard" /></div>

      {/* Info */}
      <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
          About This Tool
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-navy-300">
          This tool compares two GS positions by combining the base pay for a
          given grade and step with the locality pay adjustment for the selected
          area. Locality pay can significantly impact total compensation — for
          example, a GS-12 in San Francisco earns about 45% more than the same
          grade in a non-locality area. Use this tool to understand how
          promotions, step increases, or geographic moves affect your pay.
        </p>
      </div>

      {/* Related Guides — keep users on site */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          Related Guides
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { title: "GS Pay Scale Guide 2026", href: "/insights/gs-pay-scale-guide-2026", desc: "Grades, steps, and how to calculate your salary." },
            { title: "Locality Pay Explained", href: "/insights/federal-locality-pay-explained", desc: "How your work location affects total compensation." },
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
