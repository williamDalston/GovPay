import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Government Employee Salaries",
  description:
    "Search and explore federal and state government employee salary data. Find compensation details by name, job title, agency, or location.",
  alternates: {
    canonical: "https://www.govpay.directory/search",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
