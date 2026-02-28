import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for GovPay.Directory. Learn how we handle data and protect your privacy.",
  alternates: { canonical: "https://govpay.directory/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-navy-500">
        Last updated: February 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-navy-300">
        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            Overview
          </h2>
          <p className="mt-3">
            GovPay.Directory (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;the site&rdquo;) is committed to protecting your privacy.
            This policy explains how we collect, use, and safeguard information
            when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            Public Employee Data
          </h2>
          <p className="mt-3">
            All employee compensation data displayed on this site is derived
            from publicly available government records. This data is published by
            government agencies under the Freedom of Information Act (FOIA),
            state open records laws, and public transparency initiatives. We do
            not collect or publish any non-public personal information about
            government employees.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            Information We Collect From Visitors
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              <strong className="text-navy-200">
                Server logs:
              </strong>{" "}
              Our hosting provider may automatically collect standard server log
              data such as IP addresses, browser type, and pages visited. This
              data is used solely for security monitoring and is not shared with
              third parties.
            </p>
            <p>
              <strong className="text-navy-200">Search queries:</strong> Search
              queries are processed on our servers to return results. We do not
              log or store individual search queries.
            </p>
            <p>
              <strong className="text-navy-200">
                No account required:
              </strong>{" "}
              GovPay.Directory does not require user accounts, registration, or
              login. We do not collect email addresses, passwords, or other
              personal information from visitors.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            Cookies
          </h2>
          <p className="mt-3">
            We may use essential cookies to ensure the proper functioning of the
            website. We do not use tracking or advertising cookies. You can
            control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            Third-Party Services
          </h2>
          <p className="mt-3">
            Our site uses third-party services for hosting and content delivery.
            These services have their own privacy policies. We do not sell or
            share visitor data with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            Data Accuracy and Corrections
          </h2>
          <p className="mt-3">
            We strive to present accurate data as published by official
            government sources. If you believe any data is inaccurate, please
            contact us and we will investigate. Note that we can only display
            data as reported by the original government source.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-navy-100">
            Changes to This Policy
          </h2>
          <p className="mt-3">
            We may update this privacy policy from time to time. Changes will be
            posted on this page with an updated revision date.
          </p>
        </section>
      </div>
    </div>
  );
}
