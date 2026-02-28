"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Users, TrendingUp, Search } from "lucide-react";

interface AgencyItem {
  slug: string;
  name: string;
  abbreviation?: string;
  employeeCount: number;
  averageSalary: number;
  medianSalary: number;
}

interface AgencyGridProps {
  agencies: AgencyItem[];
}

export function AgencyGrid({ agencies }: AgencyGridProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter.trim()
    ? agencies.filter((a) => {
        const q = filter.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          (a.abbreviation && a.abbreviation.toLowerCase().includes(q))
        );
      })
    : agencies;

  return (
    <>
      <div className="relative mt-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500"
        />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter agencies..."
          aria-label="Filter agencies"
          className="w-full rounded-xl border border-navy-700 bg-navy-900 py-2.5 pl-10 pr-10 text-sm text-navy-100 placeholder-navy-500 transition-all focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
        {filter && (
          <button
            type="button"
            onClick={() => setFilter("")}
            aria-label="Clear filter"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-navy-500 hover:text-navy-300"
          >
            Clear
          </button>
        )}
      </div>

      {filter && (
        <p className="mt-2 text-xs text-navy-500">
          {filtered.length} {filtered.length === 1 ? "agency" : "agencies"} found
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-navy-700 bg-navy-900 px-6 py-12 text-center">
          <p className="text-sm text-navy-400">
            No agencies match &ldquo;{filter}&rdquo;
          </p>
          <button
            onClick={() => setFilter("")}
            className="mt-2 text-sm text-accent-blue hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agency) => (
            <Link
              key={agency.slug}
              href={`/agencies/${agency.slug}`}
              className="group rounded-xl border border-navy-700 bg-navy-900 p-6 transition-all hover:border-accent-blue/50 hover:bg-navy-800"
            >
              <div className="flex items-center gap-2">
                {agency.abbreviation && (
                  <span className="rounded bg-navy-700 px-2 py-0.5 font-data text-xs font-bold text-accent-blue">
                    {agency.abbreviation}
                  </span>
                )}
              </div>
              <h2 className="mt-2 line-clamp-2 font-heading text-sm font-bold text-navy-100 group-hover:text-accent-blue sm:text-base">
                {agency.name}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <p className="truncate font-data text-base font-bold text-navy-100 sm:text-lg">
                    {formatNumber(agency.employeeCount)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-navy-500">
                    <Users size={10} className="shrink-0" /> Employees
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-data text-base font-bold text-accent-green sm:text-lg">
                    {formatCurrency(agency.averageSalary)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-navy-500">
                    <TrendingUp size={10} className="shrink-0" /> Avg Salary
                  </p>
                </div>
              </div>
              <p className="mt-3 truncate text-xs text-navy-500">
                Median: {formatCurrency(agency.medianSalary)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
