import Link from "next/link";

const footerLinks = {
  "Browse by State": [
    { label: "California", href: "/states/california" },
    { label: "Texas", href: "/states/texas" },
    { label: "Virginia", href: "/states/virginia" },
    { label: "New York", href: "/states/new-york" },
    { label: "Florida", href: "/states/florida" },
    { label: "All States", href: "/states" },
  ],
  "Top Agencies": [
    { label: "Dept. of Defense", href: "/agencies/department-of-defense" },
    { label: "Dept. of Veterans Affairs", href: "/agencies/department-of-veterans-affairs" },
    { label: "Dept. of Homeland Security", href: "/agencies/department-of-homeland-security" },
    { label: "Dept. of Justice", href: "/agencies/department-of-justice" },
    { label: "NASA", href: "/agencies/national-aeronautics-and-space-administration" },
    { label: "All Agencies", href: "/agencies" },
  ],
  Tools: [
    { label: "GS Pay Scale", href: "/pay-scales/gs" },
    { label: "Salary Comparison", href: "/tools/compare" },
    { label: "Cost of Living", href: "/tools/cost-of-living" },
    { label: "Search Employees", href: "/search" },
  ],
  Resources: [
    { label: "Blog & Insights", href: "/insights" },
    { label: "About", href: "/about" },
    { label: "Data Sources", href: "/about#data-sources" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact", href: "mailto:contact@govpay.directory" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-navy-700 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
                {category}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-400 transition-colors hover:text-accent-blue"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-700 pt-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent-blue">
              <span className="font-[family-name:var(--font-heading)] text-xs font-bold text-white">
                GP
              </span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-sm font-bold text-navy-100">
              GovPay<span className="text-accent-blue">.Directory</span>
            </span>
          </div>
          <p className="text-center text-xs text-navy-500">
            Public employee compensation data sourced from official government
            records. All data is publicly available under FOIA and state open
            records laws.
          </p>
          <p className="text-xs text-navy-500">
            &copy; {new Date().getFullYear()} GovPay.Directory
          </p>
        </div>
      </div>
    </footer>
  );
}
