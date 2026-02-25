"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";

const navLinks = [
  { href: "/states", label: "States" },
  { href: "/agencies", label: "Agencies" },
  { href: "/pay-scales/gs", label: "Pay Scales", match: "/pay-scales" },
  { href: "/tools/compare", label: "Tools", match: "/tools" },
  { href: "/insights", label: "Insights" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(link: { href: string; match?: string }) {
    const prefix = link.match ?? link.href;
    return pathname === prefix || pathname.startsWith(prefix + "/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700 bg-navy-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-blue">
              <span className="font-[family-name:var(--font-heading)] text-sm font-bold text-white">
                GP
              </span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-navy-100">
              GovPay
              <span className="text-accent-blue">.Directory</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-navy-100 ${
                  isActive(link)
                    ? "font-medium text-accent-blue"
                    : "text-navy-400"
                }`}
                aria-current={isActive(link) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/search"
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname.startsWith("/search")
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "bg-navy-900 text-navy-400 hover:bg-navy-800 hover:text-navy-100"
              }`}
            >
              <Search size={14} />
              Search
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-navy-400" />
            ) : (
              <Menu size={24} className="text-navy-400" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
            mobileMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <nav
              aria-label="Mobile navigation"
              className="border-t border-navy-700 pb-4 pt-2"
              aria-hidden={!mobileMenuOpen}
            >
              <div className="flex flex-col gap-1">
                {[...navLinks, { href: "/search", label: "Search" }].map(
                  (link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive(link)
                          ? "bg-accent-blue/10 font-medium text-accent-blue"
                          : "text-navy-400 hover:bg-navy-900 hover:text-navy-100"
                      }`}
                      aria-current={isActive(link) ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      tabIndex={mobileMenuOpen ? 0 : -1}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
