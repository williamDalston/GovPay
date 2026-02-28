import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { ArrowRight, TrendingUp, MapPin, Briefcase, GraduationCap } from "lucide-react";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "GS Salary Comparison Tool — Compare Federal Pay Grades",
  description:
    "Compare two GS pay positions side by side. See how grade, step, and locality adjustments affect federal employee salaries. Free calculator with 2026 pay tables.",
  alternates: { canonical: "https://www.govpay.directory/tools/compare" },
};

const faqs = [
  {
    q: "What is the GS pay scale?",
    a: "The General Schedule (GS) is the primary pay system for over 1.5 million federal civilian employees. It has 15 grades (GS-1 through GS-15) and 10 steps within each grade. Each grade corresponds to a level of difficulty, responsibility, and required qualifications. Locality pay adjustments increase base salary by up to 44.72% depending on your duty station.",
  },
  {
    q: "How does locality pay affect my salary?",
    a: "Locality pay is a permanent geographic adjustment added to your GS base salary. The Office of Personnel Management defines over 50 locality areas with different adjustment percentages. For example, a GS-12 Step 1 earns $74,009 in base pay, but $98,227 in Washington, DC (32.75% adjustment) or $107,110 in San Francisco (44.72% adjustment). Employees outside designated areas receive the 'Rest of US' base rate.",
  },
  {
    q: "What is the difference between GS-12 and GS-13?",
    a: "GS-13 base pay starts at $88,012 (Step 1) compared to $74,009 for GS-12 — a difference of $14,003 or about 18.9%. GS-12 positions are typically senior individual contributors or team leads, while GS-13 roles involve greater supervisory responsibilities or deeper technical expertise. The promotion from GS-12 to GS-13 is often considered the most competitive in the federal service because many career ladders top out at GS-12.",
  },
  {
    q: "Can I negotiate a higher step when hired into federal service?",
    a: "Yes. Federal agencies can offer a starting step above Step 1 through a 'superior qualifications appointment' or a 'special need' determination. You'll need to demonstrate that your qualifications significantly exceed the minimum requirements or that your current salary justifies a higher step. Provide documentation of your current compensation and let the hiring manager know before a formal offer is made.",
  },
  {
    q: "How long does it take to move from one GS grade to the next?",
    a: "There is no fixed timeline for grade promotions — it depends on the career ladder, vacancy availability, and your qualifications. However, employees on structured career ladders (e.g., GS-5/7/9/11/12) are typically promoted every 1-2 years if performance is satisfactory. Competitive promotions to higher grades (GS-13+) require applying to posted vacancies and may take longer. Within a single grade, moving from Step 1 to Step 10 takes 18 years.",
  },
];

export default function ComparePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
            { label: "Tools" },
            { label: "Salary Comparison" },
          ]}
        />

        <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
          GS Salary Comparison Tool
        </h1>
        <p className="mt-2 text-navy-400">
          Compare two federal GS pay positions side by side. Select a grade,
          step, and locality area for each position to see how compensation
          differs across promotions, geographic moves, and step increases.
        </p>

        <CompareClient />

        <div className="mt-8"><AdSlot slot="leaderboard" /></div>

        {/* How to Use */}
        <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            How to Use This Tool
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/20 font-data text-xs font-bold text-accent-blue">1</span>
              <div>
                <p className="text-sm font-medium text-navy-200">Choose Position A</p>
                <p className="mt-1 text-xs text-navy-400">Select the grade, step, and locality area for your current or baseline position.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/20 font-data text-xs font-bold text-accent-blue">2</span>
              <div>
                <p className="text-sm font-medium text-navy-200">Choose Position B</p>
                <p className="mt-1 text-xs text-navy-400">Set the grade, step, and locality for the position you want to compare against.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/20 font-data text-xs font-bold text-accent-blue">3</span>
              <div>
                <p className="text-sm font-medium text-navy-200">Compare Results</p>
                <p className="mt-1 text-xs text-navy-400">See the annual salary difference, percentage change, and locality-adjusted totals side by side.</p>
              </div>
            </div>
          </div>
        </div>

        {/* When to Compare */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
            When to Compare Salaries
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 rounded-lg bg-navy-800/50 p-4">
              <TrendingUp size={18} className="mt-0.5 shrink-0 text-accent-green" />
              <div>
                <p className="text-sm font-medium text-navy-200">Promotion Planning</p>
                <p className="mt-1 text-xs leading-relaxed text-navy-400">
                  Considering a move from GS-12 to GS-13? Compare your current Step 5 salary
                  against a GS-13 Step 1 offer to see the actual dollar increase after locality.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg bg-navy-800/50 p-4">
              <Briefcase size={18} className="mt-0.5 shrink-0 text-accent-blue" />
              <div>
                <p className="text-sm font-medium text-navy-200">Job Offer Evaluation</p>
                <p className="mt-1 text-xs leading-relaxed text-navy-400">
                  Received an offer at a different grade or location? Compare your current
                  compensation to see whether the new position represents a real pay increase.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg bg-navy-800/50 p-4">
              <MapPin size={18} className="mt-0.5 shrink-0 text-accent-red" />
              <div>
                <p className="text-sm font-medium text-navy-200">Geographic Relocation</p>
                <p className="mt-1 text-xs leading-relaxed text-navy-400">
                  Moving from DC to Houston at the same grade? Locality pay drops from 32.75%
                  to 34.19% — but cost of living changes dramatically. Compare to see the net effect.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg bg-navy-800/50 p-4">
              <GraduationCap size={18} className="mt-0.5 shrink-0 text-navy-300" />
              <div>
                <p className="text-sm font-medium text-navy-200">Career Ladder Mapping</p>
                <p className="mt-1 text-xs leading-relaxed text-navy-400">
                  On a GS-5/7/9/11 career ladder? Map out your expected salary at each grade
                  and step to understand your long-term compensation trajectory.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About This Tool */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
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
          <p className="mt-3 text-sm leading-relaxed text-navy-300">
            All salary figures use the official 2026 GS base pay table published
            by OPM in January 2026. Locality adjustment percentages reflect the
            rates set by the President&apos;s Pay Agent for calendar year 2026.
            This tool calculates annual salary only — it does not include
            benefits such as FEHB, FERS, TSP matching, or paid leave, which
            typically add 30-40% in value above base salary.
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
    </>
  );
}
