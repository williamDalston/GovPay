import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getGlobalStats } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { Database, Shield, RefreshCw, Scale } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About GovPay.Directory",
  description:
    "Learn about GovPay.Directory, our data sources, methodology, and commitment to transparency in government employee compensation data.",
  alternates: { canonical: "https://govpay.directory/about" },
};

export default async function AboutPage() {
  const stats = await getGlobalStats();
  const employeeLabel = stats.totalEmployees > 0
    ? formatNumber(stats.totalEmployees)
    : "2 million+";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About GovPay.Directory",
    description:
      "GovPay.Directory aggregates publicly available government employee compensation data from official sources.",
    mainEntity: {
      "@type": "Organization",
      name: "GovPay.Directory",
      url: "https://govpay.directory",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "About" }]}
        />

        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
          About GovPay.Directory
        </h1>
        <p className="mt-3 text-lg text-navy-400">
          Bringing transparency to public employee compensation data across
          America.
        </p>

        {/* Mission */}
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
            Our Mission
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-navy-300">
            <p>
              GovPay.Directory makes it easy to search, explore, and compare
              public employee compensation data. All data presented on this site
              is derived from publicly available government records, published
              under the Freedom of Information Act (FOIA) and state open records
              laws.
            </p>
            <p>
              Government salary data is public information. Taxpayers fund these
              salaries and have a right to know how public funds are allocated.
              Our goal is to make this data accessible, searchable, and
              understandable.
            </p>
          </div>
        </section>

        {/* Data Sources */}
        <section id="data-sources" className="mt-10">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
            Data Sources
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Database,
                title: "OPM FedScope",
                desc: "Federal workforce statistics from the Office of Personnel Management. Provides aggregate employment data across all federal agencies, including headcounts and average salaries by agency, location, and occupation.",
                url: "https://www.fedscope.opm.gov/",
              },
              {
                icon: Scale,
                title: "Texas Comptroller",
                desc: "Individual state employee compensation records from the Texas Comptroller of Public Accounts. Includes names, positions, agencies, and annual salaries for all Texas state employees.",
                url: "https://data.texas.gov/",
              },
              {
                icon: Shield,
                title: "California State Controller",
                desc: "California state employee salary data from the State Controller's Office. Includes department, classification, and total wages for state civil service employees.",
                url: "https://publicpay.ca.gov/",
              },
              {
                icon: RefreshCw,
                title: "GS Pay Scale (OPM)",
                desc: "Official General Schedule pay tables published annually by OPM, including base pay rates for all 15 grades and 10 steps, plus locality adjustment rates for 50+ areas.",
                url: "https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/",
              },
            ].map((source) => (
              <div
                key={source.title}
                className="rounded-xl border border-navy-700 bg-navy-900 p-5"
              >
                <div className="flex items-center gap-2">
                  <source.icon size={18} className="text-accent-blue" />
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                    {source.title}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-navy-400">
                  {source.desc}
                </p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-accent-blue transition-colors hover:text-accent-blue/80"
                >
                  Visit Source &rarr;
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
            Methodology
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-navy-300">
            <p>
              Data is ingested from official sources through automated ETL
              (Extract, Transform, Load) pipelines. Records are normalized to a
              consistent format, de-duplicated, and loaded into our database.
            </p>
            <p>
              Federal employee data from OPM FedScope is aggregated and
              anonymized at the source — it does not contain individual names.
              Individual employee records come from state transparency portals
              that publish this data as a matter of public policy.
            </p>
            <p>
              GS pay scale data is sourced directly from OPM&apos;s published pay
              tables for the current fiscal year. Locality pay adjustments are
              applied using the official rates for each designated locality pay
              area.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-4">
            {[
              {
                q: "Is this data accurate?",
                a: "All data comes directly from official government sources. We do not modify salary figures. However, data may be from a specific reporting period and may not reflect current salaries.",
              },
              {
                q: "How often is the data updated?",
                a: "We refresh our data quarterly when new government datasets are published. The GS pay scale is updated annually when OPM releases new tables.",
              },
              {
                q: "Why are some employees not listed?",
                a: "Some positions are exempt from public disclosure for national security or personal safety reasons. Additionally, we only include data from sources that make individual records publicly available.",
              },
              {
                q: "Can I request removal of my data?",
                a: "This data is publicly available under FOIA and state open records laws. We display the same information available from official government sources. If you have concerns, email us at info@alstonanalytics.com.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-navy-700 bg-navy-900 p-5"
              >
                <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                  {faq.q}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-navy-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-10 rounded-xl border border-navy-700 bg-navy-900 p-6 text-center sm:p-8">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
            Start Exploring
          </h2>
          <p className="mt-2 text-sm text-navy-400">
            Search {employeeLabel} government employee salary records.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/search"
              className="w-full rounded-xl bg-accent-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-blue/80 active:scale-[0.98] sm:w-auto"
            >
              Search Salaries
            </Link>
            <Link
              href="/agencies"
              className="w-full rounded-xl border border-navy-700 px-6 py-3 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-800 active:scale-[0.98] sm:w-auto"
            >
              Browse Agencies
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
