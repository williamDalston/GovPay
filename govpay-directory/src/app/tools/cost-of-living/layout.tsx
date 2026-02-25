import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cost of Living Calculator — Salary Adjustment Tool",
  description:
    "Calculate how far your federal salary goes in different cities. Adjust for housing, food, transportation, and other cost-of-living factors.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Cost of Living Calculator",
  description:
    "Calculate how far your federal salary goes in different cities.",
  url: "https://govpay.directory/tools/cost-of-living",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function CostOfLivingLayout({
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
