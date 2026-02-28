import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { ARTICLES } from "@/lib/articles";
import {
  TrendingUp,
  Building2,
  MapPin,
  Calculator,
  BarChart3,
  DollarSign,
  BookOpen,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Insights — Government Salary Trends & Analysis",
  description:
    "Explore trends and analysis of government employee compensation data. Federal salary insights, agency comparisons, and pay scale analysis.",
  alternates: { canonical: "https://govpay.directory/insights" },
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
      itemListElement: [
        ...ARTICLES.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Article",
            headline: article.title,
            url: `https://govpay.directory/insights/${article.slug}`,
            datePublished: article.publishedAt,
          },
        })),
        ...insights.map((insight, index) => ({
          "@type": "ListItem",
          position: ARTICLES.length + index + 1,
          name: insight.title,
          url: `https://govpay.directory${insight.href}`,
        })),
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
        items={[{ label: "Home", href: "/" }, { label: "Insights" }]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Insights & Analysis
      </h1>
      <p className="mt-2 text-navy-400">
        Trends, comparisons, and analysis of government employee compensation
        data across America.
      </p>

      {/* Articles */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          <BookOpen size={18} className="mr-2 inline text-accent-blue" />
          Articles & Guides
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article, index) => (
            <AnimateOnScroll key={article.slug} delay={index * 60}>
              <Link
                href={`/insights/${article.slug}`}
                className="group flex flex-col rounded-xl border border-navy-700 bg-navy-900 p-6 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">
                  {article.category}
                </span>
                <h3 className="mt-2 font-heading text-base font-bold leading-tight text-navy-100 group-hover:text-accent-blue">
                  {article.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-navy-400">
                  {article.description}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-navy-500">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {article.readingTime}
                  </span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

      {/* Data Tools */}
      <div className="mt-10">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          Interactive Tools
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <h3 className="mt-4 font-heading text-base font-bold text-navy-100 group-hover:text-accent-blue">
                  {insight.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-navy-400">
                  {insight.description}
                </p>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

    </div>
    </>
  );
}
