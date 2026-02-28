"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Search } from "lucide-react";

const navLinks = [
  { href: "/states", label: "States" },
  { href: "/agencies", label: "Agencies" },
  { href: "/pay-scales", label: "Pay Scales" },
  { href: "/tools/compare", label: "Tools", match: "/tools" },
  { href: "/insights", label: "Insights" },
];

const mobileNavLinks = [
  { href: "/states", label: "States" },
  { href: "/agencies", label: "Agencies" },
  { href: "/pay-scales", label: "Pay Scales" },
  { href: "/tools/compare", label: "Salary Comparison", match: "/tools" },
  { href: "/tools/cost-of-living", label: "Cost of Living", match: "/tools" },
  { href: "/insights", label: "Insights" },
  { href: "/search", label: "Search" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);

  function isActive(link: { href: string; match?: string }) {
    const prefix = link.match ?? link.href;
    return pathname === prefix || pathname.startsWith(prefix + "/");
  }

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, closeMenu]);

  // Trap focus within mobile menu
  useEffect(() => {
    if (!mobileMenuOpen || !navRef.current) return;
    const nav = navRef.current;
    const focusableEls = nav.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl || document.activeElement === menuButtonRef.current) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          menuButtonRef.current?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [mobileMenuOpen]);

  // Close menu on route change (needed for browser back/forward navigation)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate: syncing UI state with external navigation events
    setMobileMenuOpen(false);
  }, [pathname]);

  // Measure active nav link for sliding indicator
  useEffect(() => {
    const nav = desktopNavRef.current;
    if (!nav) return;
    const activeLink = nav.querySelector('[aria-current="page"]') as HTMLElement | null;
    if (activeLink) {
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicator({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        visible: true,
      });
    } else {
      setIndicator((prev) => ({ ...prev, visible: false }));
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700 bg-navy-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-blue">
              <span className="font-heading text-sm font-bold text-white">
                GP
              </span>
            </div>
            <span className="font-heading text-lg font-bold text-navy-100">
              GovPay
              <span className="text-accent-blue">.Directory</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav ref={desktopNavRef} aria-label="Main navigation" className="relative hidden items-center gap-6 md:flex">
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
            {/* Active link sliding indicator */}
            <div
              className="absolute bottom-0 h-0.5 rounded-full bg-accent-blue transition-all duration-300 ease-out"
              style={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.visible ? 1 : 0,
              }}
            />
          </nav>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            className="flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
            onClick={() => (mobileMenuOpen ? closeMenu() : setMobileMenuOpen(true))}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
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
              id="mobile-nav"
              ref={navRef}
              aria-label="Mobile navigation"
              className="border-t border-navy-700 pb-4 pt-2"
              aria-hidden={!mobileMenuOpen}
            >
              <div className="flex flex-col gap-1">
                {mobileNavLinks.map(
                  (link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-lg px-3 py-3.5 text-base transition-colors ${
                        isActive(link)
                          ? "bg-accent-blue/10 font-medium text-accent-blue"
                          : "text-navy-400 hover:bg-navy-900 hover:text-navy-100"
                      }`}
                      aria-current={isActive(link) ? "page" : undefined}
                      onClick={() => closeMenu()}
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
