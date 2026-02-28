import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { US_STATES } from "@/lib/reference-data";

export const metadata: Metadata = {
  title: "Browse by State — Federal Employee Salaries",
  description:
    "Browse federal employee salary data across all 50 states and DC. Find government compensation data in your state.",
};

export default function StatesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Browse Federal Employee Salaries by State",
    description: "Federal employee compensation data for all 50 states and DC.",
    numberOfItems: US_STATES.length,
    itemListElement: US_STATES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://govpay.directory/states/${s.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "States" }]} />

        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
          Browse by State
        </h1>
        <p className="mt-2 text-navy-400">
          Federal employee compensation data for all 50 states and DC.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {US_STATES.map((state, index) => (
            <AnimateOnScroll key={state.slug} delay={index * 20}>
              <Link
                href={`/states/${state.slug}`}
                className="group flex items-center gap-2.5 rounded-xl border border-navy-700 bg-navy-900 p-3 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5 sm:gap-3 sm:p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 font-[family-name:var(--font-data)] text-xs font-bold text-accent-blue group-hover:bg-accent-blue group-hover:text-white sm:h-10 sm:w-10 sm:text-sm">
                  {state.abbreviation}
                </span>
                <span className="truncate text-sm text-navy-200 group-hover:text-navy-100">
                  {state.name}
                </span>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </>
  );
}
