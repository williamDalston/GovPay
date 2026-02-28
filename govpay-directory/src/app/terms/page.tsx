import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing use of the GovPay.Directory federal employee salary database.",
  alternates: { canonical: "https://govpay.directory/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-navy-500">
        Last updated: February 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-navy-300">
        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            1. Public Records Disclaimer
          </h2>
          <p className="mt-3">
            GovPay.Directory aggregates publicly available government employee
            compensation data sourced from official records including the U.S.
            Office of Personnel Management (OPM) FedScope database, state
            comptroller offices, and other public agencies. All salary data
            displayed on this site is a matter of public record under the
            Freedom of Information Act (FOIA) and applicable state open records
            laws.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            2. Data Accuracy
          </h2>
          <p className="mt-3">
            While we strive to maintain accurate and up-to-date information,
            GovPay.Directory makes no warranties or representations regarding
            the completeness, accuracy, or timeliness of the data presented.
            Salary figures may reflect a specific fiscal year and may not
            represent current compensation. Users should verify information
            with official government sources before making any decisions based
            on the data.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            3. Acceptable Use
          </h2>
          <p className="mt-3">You agree not to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-navy-400">
            <li>
              Use automated tools to scrape or harvest data at a rate that
              degrades service for other users
            </li>
            <li>
              Republish data in bulk without attribution to GovPay.Directory
              and the original government sources
            </li>
            <li>
              Use the data to harass, intimidate, or discriminate against any
              individual
            </li>
            <li>
              Misrepresent the data or imply endorsement by any government
              agency
            </li>
            <li>
              Attempt to gain unauthorized access to our systems or
              infrastructure
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            4. Limitation of Liability
          </h2>
          <p className="mt-3">
            GovPay.Directory is provided &ldquo;as is&rdquo; without warranty
            of any kind, express or implied. In no event shall GovPay.Directory
            or its operators be liable for any direct, indirect, incidental,
            special, or consequential damages arising from your use of or
            inability to use the service, including but not limited to reliance
            on salary data for employment, financial, or legal decisions.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            5. Intellectual Property
          </h2>
          <p className="mt-3">
            The underlying government salary data is in the public domain.
            However, the site design, software, tools, analyses, and
            presentation of data are the property of GovPay.Directory. The GS
            pay scale calculator, salary comparison tool, and cost-of-living
            calculator are original works protected by copyright.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            6. DMCA & Content Removal
          </h2>
          <p className="mt-3">
            If you believe any content on this site infringes your copyright or
            if you are a government employee who wishes to request correction
            of inaccurate data, please contact us. We will investigate all
            legitimate requests and respond within a reasonable timeframe.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            7. Changes to These Terms
          </h2>
          <p className="mt-3">
            We reserve the right to modify these terms at any time. Changes
            will be posted on this page with an updated revision date.
            Continued use of the site after changes constitutes acceptance of
            the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
