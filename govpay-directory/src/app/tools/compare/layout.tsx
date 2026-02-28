import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Federal Salaries — Side-by-Side Tool",
  description:
    "Compare GS pay grades, steps, and locality areas side by side. See how location and grade affect federal employee compensation.",
  alternates: { canonical: "https://www.govpay.directory/tools/compare" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Federal Salary Comparison Tool",
  description:
    "Compare GS pay grades, steps, and locality areas side by side.",
  url: "https://www.govpay.directory/tools/compare",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function CompareLayout({
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
