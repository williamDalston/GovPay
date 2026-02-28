"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  GS_BASE_PAY_2026,
  GS_GRADES,
  GS_STEPS,
  LOCALITY_AREAS,
  DATA_LAST_UPDATED,
} from "@/lib/reference-data";
import { formatCurrency } from "@/lib/format";

export default function GSPayScaleClient() {
  const [selectedLocality, setSelectedLocality] = useState(
    LOCALITY_AREAS[0].slug
  );

  const locality = LOCALITY_AREAS.find((l) => l.slug === selectedLocality) ?? LOCALITY_AREAS[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "2026 General Schedule (GS) Federal Pay Scale",
    description:
      "Complete GS pay table for 2026 with 15 grades, 10 steps, and locality adjustments for 50+ pay areas. Published by the U.S. Office of Personnel Management.",
    url: "https://www.govpay.directory/pay-scales/gs",
    license: "https://www.usa.gov/government-works",
    creator: {
      "@type": "GovernmentOrganization",
      name: "U.S. Office of Personnel Management",
      url: "https://www.opm.gov",
    },
    temporalCoverage: "2026",
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/html",
      contentUrl: "https://www.govpay.directory/pay-scales/gs",
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
        items={[
          { label: "Home", href: "/" },
          { label: "Pay Scales", href: "/pay-scales" },
          { label: "GS Pay Scale" },
        ]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        GS Pay Scale 2026
      </h1>
      <p className="mt-2 text-navy-400">
        General Schedule pay table for federal employees. Select a locality area
        to see adjusted rates.
      </p>

      {/* Locality Selector */}
      <div className="mt-6">
        <label htmlFor="gs-locality" className="block text-sm font-medium text-navy-400">
          Locality Pay Area
        </label>
        <select
          id="gs-locality"
          value={selectedLocality}
          onChange={(e) => setSelectedLocality(e.target.value)}
          className="mt-1 w-full max-w-md rounded-lg border border-navy-700 bg-navy-900 px-4 py-2.5 text-sm text-navy-100 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
        >
          {LOCALITY_AREAS.map((area) => (
            <option key={area.slug} value={area.slug}>
              {area.area}{" "}
              {area.adjustment !== 1.0
                ? `(+${((area.adjustment - 1) * 100).toFixed(1)}%)`
                : "(Base)"}
            </option>
          ))}
        </select>
      </div>

      {/* Pay Table */}
      <p className="mt-6 text-xs text-navy-500 sm:hidden">Scroll horizontally to see all steps &rarr;</p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-navy-700 sm:mt-6">
        <table className="w-full min-w-[800px]" aria-label="2026 General Schedule pay rates by grade and step">
          <thead>
            <tr className="border-b border-navy-700 bg-navy-900">
              <th className="sticky left-0 bg-navy-900 px-4 py-3 text-left font-heading text-xs font-bold text-navy-400">
                Grade
              </th>
              {GS_STEPS.map((step) => (
                <th
                  key={step}
                  className="px-3 py-3 text-right font-heading text-xs font-bold text-navy-400"
                >
                  Step {step}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {GS_GRADES.map((grade) => (
              <tr
                key={grade}
                className="transition-colors hover:bg-navy-800/50"
              >
                <td className="sticky left-0 bg-navy-950 px-4 py-2.5">
                  <Link
                    href={`/pay-scales/gs/${grade}`}
                    className="font-data text-sm font-bold text-accent-blue hover:underline"
                  >
                    GS-{grade}
                  </Link>
                </td>
                {GS_STEPS.map((step) => {
                  const basePay = GS_BASE_PAY_2026[grade][step - 1];
                  const adjustedPay = Math.round(
                    basePay * locality.adjustment
                  );

                  return (
                    <td
                      key={step}
                      className="px-3 py-2.5 text-right font-data text-xs text-navy-300 transition-colors hover:bg-accent-blue/20 hover:text-accent-blue"
                    >
                      {formatCurrency(adjustedPay)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grade detail links */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          Explore by Grade
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {GS_GRADES.map((grade) => (
            <Link
              key={grade}
              href={`/pay-scales/gs/${grade}`}
              className="rounded-lg border border-navy-700 bg-navy-900 p-3 text-center transition-all hover:border-accent-blue/50 hover:bg-navy-800"
            >
              <span className="font-data text-sm font-bold text-accent-blue">
                GS-{grade}
              </span>
              <br />
              <span className="text-xs text-navy-500">
                {formatCurrency(
                  Math.round(GS_BASE_PAY_2026[grade][0] * locality.adjustment)
                )}
                –
                {formatCurrency(
                  Math.round(GS_BASE_PAY_2026[grade][9] * locality.adjustment)
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Related Guides */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-navy-100">
          Learn More
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link
            href="/insights/gs-pay-scale-guide-2026"
            className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Guide</span>
            <p className="mt-1 font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue">
              Complete GS Pay Scale Guide 2026
            </p>
            <p className="mt-1 text-xs text-navy-400">Grades, steps, locality adjustments, and salary calculations explained.</p>
          </Link>
          <Link
            href="/insights/federal-locality-pay-explained"
            className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Guide</span>
            <p className="mt-1 font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue">
              Locality Pay Explained
            </p>
            <p className="mt-1 text-xs text-navy-400">How location affects your salary and which areas pay the most.</p>
          </Link>
          <Link
            href="/insights/federal-employee-step-increases"
            className="group rounded-xl border border-navy-700 bg-navy-900 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Guide</span>
            <p className="mt-1 font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue">
              How Step Increases Work
            </p>
            <p className="mt-1 text-xs text-navy-400">Waiting periods, eligibility, and strategies for faster progression.</p>
          </Link>
        </div>
      </div>

      {/* Info section */}
      <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy-400">
          About the GS Pay Scale
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-navy-300">
          <p>
            The General Schedule (GS) is the predominant pay scale within the
            United States civil service. The GS includes the majority of
            white-collar personnel positions. The system consists of 15 grades
            (GS-1 through GS-15) with 10 steps within each grade.
          </p>
          <p>
            Base pay is adjusted based on locality. The federal government
            recognizes over 50 locality pay areas, each with a different
            adjustment rate. The highest locality adjustments are in the San
            Francisco and Washington, DC metro areas.
          </p>
          <p>
            Employees typically advance one step after serving the required
            waiting period: 1 year for steps 1–3, 2 years for steps 4–6, and 3
            years for steps 7–9. Within-grade increases are based on acceptable
            performance.
          </p>
        </div>
        <div className="mt-4 border-t border-navy-700 pt-4">
          <p className="text-xs text-navy-500">
            <strong className="text-navy-400">Data Source:</strong>{" "}
            <a
              href="https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:underline"
            >
              U.S. Office of Personnel Management
            </a>{" "}
            | Last updated: {DATA_LAST_UPDATED.gsPayScale}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
