import type { Metadata } from "next";
import { Space_Mono, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";

const spaceMono = Space_Mono({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://govpay.directory"),
  title: {
    default: "GovPay.Directory — Public Employee Compensation Explorer",
    template: "%s | GovPay.Directory",
  },
  description:
    "Search and explore public employee salaries across federal, state, and local government. Compare compensation data for over 2 million government workers.",
  keywords: [
    "government salaries",
    "federal employee pay",
    "public employee compensation",
    "GS pay scale",
    "government pay",
  ],
  openGraph: {
    type: "website",
    siteName: "GovPay.Directory",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GovPayDir",
    creator: "@GovPayDir",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="dns-prefetch" href="https://supabase.co" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
      </head>
      <body
        className={`${spaceMono.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent-blue focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="min-h-screen">{children}</main>
        <Footer />
        <BackToTop />
        <Analytics />
      </body>
    </html>
  );
}
