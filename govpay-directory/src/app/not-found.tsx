import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { Home, Building2, MapPin, Calculator } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
      <p className="font-data text-5xl font-bold text-accent-blue sm:text-6xl">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-3 text-sm text-navy-400 sm:text-base">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Try searching for what you need.
      </p>

      <div className="mx-auto mt-8 max-w-lg">
        <SearchBar size="large" />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Home, label: "Home", href: "/" },
          { icon: Building2, label: "Agencies", href: "/agencies" },
          { icon: MapPin, label: "States", href: "/states" },
          { icon: Calculator, label: "Pay Scales", href: "/pay-scales/gs" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-center gap-2 rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-navy-300 transition-all active:scale-[0.98] hover:border-accent-blue/50 hover:bg-navy-800 hover:text-accent-blue"
          >
            <link.icon size={16} />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
