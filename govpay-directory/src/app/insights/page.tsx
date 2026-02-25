import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import {
  TrendingUp,
  Building2,
  MapPin,
  Calculator,
  BarChart3,
  DollarSign,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Insights — Government Salary Trends & Analysis",
  description:
    "Explore trends and analysis of government employee compensation data. Federal salary insights, agency comparisons, and pay scale analysis.",
};

const insights = [
  {
    icon: TrendingUp,
    title: "Highest Paying Federal Agencies",
    description:
      "Compare average salaries across federal agencies. Discover which agencies offer the most competitive compensation packages.",
    href: "/agencies",
    color: "text-accent-blue",
  },
  {
    icon: MapPin,
    title: "Salaries by State",
    description:
      "See how federal employee pay varies across all 50 states. Location matters — locality pay adjustments can add up to 44% to base salary.",
    href: "/states",
    color: "text-accent-green",
  },
  {
    icon: Calculator,
    title: "GS Pay Scale Breakdown",
    description:
      "Interactive tables for all 15 GS grades and 10 steps. See how locality adjustments affect your take-home pay in every metro area.",
    href: "/pay-scales/gs",
    color: "text-accent-amber",
  },
  {
    icon: BarChart3,
    title: "Compare Salaries",
    description:
      "Side-by-side salary comparison tool. Compare GS grades, steps, and locality areas to understand your compensation options.",
    href: "/tools/compare",
    color: "text-accent-red",
  },
  {
    icon: DollarSign,
    title: "Cost of Living Adjustment",
    description:
      "Calculate how far your federal salary goes in different cities. Our cost of living tool adjusts for housing, food, and transportation costs.",
    href: "/tools/cost-of-living",
    color: "text-accent-blue",
  },
  {
    icon: Building2,
    title: "Agency Deep Dives",
    description:
      "Detailed profiles for every federal agency showing employee counts, salary distributions, top occupations, and geographic footprint.",
    href: "/agencies",
    color: "text-accent-green",
  },
];

export default function InsightsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Government Salary Insights & Analysis",
    description:
      "Trends, comparisons, and analysis of government employee compensation data across America.",
    url: "https://govpay.directory/insights",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: insights.map((insight, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: insight.title,
        url: `https://govpay.directory${insight.href}`,
      })),
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
        items={[{ label: "Home", href: "/" }, { label: "Insights" }]}
      />

      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
        Insights & Analysis
      </h1>
      <p className="mt-2 text-navy-400">
        Trends, comparisons, and analysis of government employee compensation
        data across America.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <AnimateOnScroll key={insight.title} delay={index * 60}>
          <Link
            href={insight.href}
            className="group rounded-xl border border-navy-700 bg-navy-900 p-6 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5"
          >
            <insight.icon
              size={24}
              className={`${insight.color} transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110`}
            />
            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-base font-bold text-navy-100 group-hover:text-accent-blue">
              {insight.title}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-navy-400">
              {insight.description}
            </p>
          </Link>
          </AnimateOnScroll>
        ))}
      </div>

    </div>
    </>
  );
}
