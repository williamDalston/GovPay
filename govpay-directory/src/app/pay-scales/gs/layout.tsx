import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GS Pay Scale 2025 — Federal Employee Pay Grades",
  description:
    "Interactive 2025 General Schedule pay table for all 15 GS grades and 10 steps. View locality-adjusted rates for 50+ pay areas.",
  alternates: { canonical: "https://govpay.directory/pay-scales/gs" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GS Pay Scale Calculator",
  description:
    "Interactive 2025 General Schedule pay table for all 15 GS grades and 10 steps with locality adjustments.",
  url: "https://govpay.directory/pay-scales/gs",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function GSPayScaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
