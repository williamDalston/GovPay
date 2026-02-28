import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { COST_INDICES } from "@/lib/reference-data";
import { formatCurrency } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import CostOfLivingClient from "./CostOfLivingClient";

export const metadata: Metadata = {
  title: "Cost of Living Salary Adjuster — Federal Pay Calculator",
  description:
    "Calculate what your federal salary is worth in different cities. Compare cost of living adjustments across 21 major metro areas with 2026 index data.",
  alternates: { canonical: "https://www.govpay.directory/tools/cost-of-living" },
};

const faqs = [
  {
    q: "What is a cost of living index?",
    a: "A cost of living index measures how expensive it is to live in a particular city relative to the national average (index = 100). An index of 150 means that city is 50% more expensive than average. The index accounts for housing, groceries, transportation, healthcare, and utilities. We use BLS Consumer Price Index data to calculate these indices.",
  },
  {
    q: "Does locality pay fully offset cost of living?",
    a: "Not always. Locality pay is set by OPM based on labor market surveys, not directly on consumer prices. In some expensive cities like San Francisco (COL index 179.9, locality +44.7%), the locality adjustment roughly tracks cost of living. In others like New York (COL index 187.2, locality +36.1%), the gap is wider. Use this calculator alongside the locality tables to compare your real purchasing power.",
  },
  {
    q: "Which federal duty stations have the lowest cost of living?",
    a: "Cities like Detroit (index 89.4), Indianapolis (index 89.2), San Antonio (index 90.8), and Columbus (index 93.1) rank among the most affordable metro areas for federal employees. Federal workers stationed in these cities often enjoy higher purchasing power because they still receive locality pay while living in a more affordable market.",
  },
  {
    q: "Should I take a transfer to a cheaper city?",
    a: "It depends on the full financial picture. Moving from Washington, DC to Houston drops your COL index from 152.1 to 96.5 — your salary buys 58% more. However, locality pay also changes (DC: +32.75%, Houston: +34.19%). Factor in moving costs, housing market differences, spousal employment, and quality-of-life preferences. This calculator helps you quantify the salary side of that decision.",
  },
];

const sortedCities = [...COST_INDICES].sort((a, b) => b.index - a.index);
const topCities = sortedCities.slice(0, 5);
const bottomCities = sortedCities.slice(-5).reverse();

export default function CostOfLivingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const referenceSalary = 85000;

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
            { label: "Tools" },
            { label: "Cost of Living Calculator" },
          ]}
        />

        <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
          Cost of Living Salary Adjuster
        </h1>
        <p className="mt-2 text-navy-400">
          See how far your federal salary goes in different cities across the
          country. Enter your current salary and compare purchasing power
          between any two metro areas.
        </p>

        <CostOfLivingClient />

        <div className="mt-8"><AdSlot slot="leaderboard" /></div>

        {/* Locality Pay vs COL */}
        <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            Locality Pay vs. Cost of Living
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-navy-300">
            <p>
              Federal employees often confuse <strong className="text-navy-200">locality pay</strong> with{" "}
              <strong className="text-navy-200">cost of living</strong>, but they measure different things.
              Locality pay is set annually by OPM based on surveys comparing federal and private-sector
              wages in each area — it reflects the <em>labor market</em>, not consumer prices. Cost of living
              measures how much you actually spend on housing, food, transportation, and other essentials.
            </p>
            <p>
              In practice, this means some cities offer better purchasing power than their locality
              adjustment suggests. Houston has a 34.19% locality adjustment but a below-average cost
              of living index of 96.5 — making it one of the best value locations for federal workers.
              Conversely, New York&apos;s 36.14% locality pay doesn&apos;t fully compensate for its
              187.2 cost of living index.
            </p>
          </div>
        </div>

        {/* Highest and Lowest Cost Cities */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-accent-red">
              Most Expensive Cities
            </h2>
            <table className="mt-4 w-full" aria-label="Most expensive cities for federal employees">
              <thead>
                <tr className="border-b border-navy-700 text-left text-xs text-navy-500">
                  <th className="pb-2 font-medium">City</th>
                  <th className="pb-2 text-right font-medium">COL Index</th>
                  <th className="pb-2 text-right font-medium">$85K Equiv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {topCities.map((c) => (
                  <tr key={c.city} className="text-sm">
                    <td className="py-2 text-navy-200">{c.city}</td>
                    <td className="py-2 text-right font-data text-accent-red">{c.index}</td>
                    <td className="py-2 text-right font-data text-navy-400">
                      {formatCurrency(Math.round((referenceSalary / 100) * c.index))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-navy-500">
              You&apos;d need the &quot;Equiv.&quot; salary to maintain the same purchasing power as $85K at the national average.
            </p>
          </div>
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-accent-green">
              Most Affordable Cities
            </h2>
            <table className="mt-4 w-full" aria-label="Most affordable cities for federal employees">
              <thead>
                <tr className="border-b border-navy-700 text-left text-xs text-navy-500">
                  <th className="pb-2 font-medium">City</th>
                  <th className="pb-2 text-right font-medium">COL Index</th>
                  <th className="pb-2 text-right font-medium">$85K Equiv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {bottomCities.map((c) => (
                  <tr key={c.city} className="text-sm">
                    <td className="py-2 text-navy-200">{c.city}</td>
                    <td className="py-2 text-right font-data text-accent-green">{c.index}</td>
                    <td className="py-2 text-right font-data text-navy-400">
                      {formatCurrency(Math.round((referenceSalary / 100) * c.index))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-navy-500">
              Your $85K salary has more purchasing power in these cities — you only need the &quot;Equiv.&quot; amount.
            </p>
          </div>
        </div>

        {/* About This Tool */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
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
          <p className="mt-3 text-sm leading-relaxed text-navy-300">
            Cost-of-living indices are derived from BLS Consumer Price Index data
            (last updated Q4 2025) and cover housing, groceries, transportation,
            healthcare, and utilities. These indices are independent of the OPM
            locality pay adjustments — use both together for the most accurate
            picture of your real compensation in a given city.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 divide-y divide-navy-800">
            {faqs.map((faq) => (
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
    </>
  );
}
