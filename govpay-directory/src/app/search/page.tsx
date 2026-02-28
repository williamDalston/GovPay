"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchBar } from "@/components/SearchBar";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Employee, Agency } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import Link from "next/link";
import { Building2, Users, Briefcase, Loader2 } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const agencyFilter = searchParams.get("agency");
  const stateFilter = searchParams.get("state");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(
    async (p: number) => {
      const params = new URLSearchParams();
      if (initialQuery) params.set("q", initialQuery);
      if (agencyFilter) params.set("agency", agencyFilter);
      if (stateFilter) params.set("state", stateFilter);
      params.set("page", String(p));

      if (!initialQuery && !agencyFilter && !stateFilter) return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) throw new Error("Search request failed");
        const data = await res.json();
        setEmployees(data.employees ?? []);
        setAgencies(data.agencies ?? []);
        setTotal(data.total ?? 0);
        setPage(p);
      } catch {
        setError("Something went wrong with the search. Please try again.");
        setEmployees([]);
        setAgencies([]);
        setTotal(0);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    },
    [initialQuery, agencyFilter, stateFilter]
  );

  useEffect(() => {
    doSearch(1);
  }, [doSearch]);

  if (loading && !searched) {
    return (
      <div className="mt-12 flex items-center justify-center gap-2 text-navy-400">
        <Loader2 size={18} className="animate-spin" />
        Searching...
      </div>
    );
  }

  if (!searched) return null;

  if (error) {
    return (
      <div className="mt-12 rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-center">
        <p className="text-sm font-medium text-red-400">{error}</p>
        <button
          onClick={() => doSearch(1)}
          className="mt-3 rounded-lg bg-navy-800 px-4 py-2 text-sm text-navy-300 transition-colors active:scale-[0.98] hover:bg-navy-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Active filter badges */}
      {(initialQuery || agencyFilter || stateFilter) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-navy-500">Showing results for:</span>
          {initialQuery && (
            <span className="rounded-full bg-accent-blue/10 px-3 py-1 text-accent-blue">
              &ldquo;{initialQuery}&rdquo;
            </span>
          )}
          {agencyFilter && (
            <span className="rounded-full bg-navy-800 px-3 py-1 text-navy-300">
              Agency: {agencyFilter}
            </span>
          )}
          {stateFilter && (
            <span className="rounded-full bg-navy-800 px-3 py-1 text-navy-300">
              State: {stateFilter}
            </span>
          )}
        </div>
      )}

      {/* Agency Results */}
      {agencies.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-navy-100">
            <Building2 size={18} className="text-accent-blue" />
            Agencies
            <span className="text-sm font-normal text-navy-500">
              ({agencies.length})
            </span>
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <Link
                key={agency.slug}
                href={`/agencies/${agency.slug}`}
                className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-900 p-4 transition-all hover:-translate-y-0.5 hover:border-accent-blue/50 hover:bg-navy-800 hover:shadow-lg hover:shadow-accent-blue/5"
              >
                {agency.abbreviation && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800 font-data text-xs font-bold text-accent-blue">
                    {agency.abbreviation}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-100">
                    {agency.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-navy-500">
                    <Users size={10} />
                    {formatNumber(agency.employeeCount)} employees
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Employee Results */}
      <div>
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-navy-100">
          <Briefcase size={18} className="text-accent-green" />
          Employees
          <span className="text-sm font-normal text-navy-500">
            ({total})
          </span>
        </h2>
        {employees.length > 0 ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((emp, index) => (
                <div
                  key={emp.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <EmployeeCard employee={emp} />
                </div>
              ))}
            </div>
            {/* Pagination */}
            {total > 20 && (
              <nav aria-label="Search results pagination" className="mt-6 flex items-center justify-center gap-2 sm:gap-4">
                <button
                  onClick={() => doSearch(page - 1)}
                  disabled={page <= 1 || loading}
                  aria-label="Go to previous page"
                  className="rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-sm text-navy-400 transition-colors active:scale-[0.98] hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-30 sm:px-4"
                >
                  Prev
                </button>
                <span className="text-xs text-navy-500 sm:text-sm" aria-live="polite">
                  {page} / {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => doSearch(page + 1)}
                  disabled={page >= Math.ceil(total / 20) || loading}
                  aria-label="Go to next page"
                  className="rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-sm text-navy-400 transition-colors active:scale-[0.98] hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-30 sm:px-4"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-navy-400">
              No employees found matching your search.
            </p>
            <p className="mt-2 text-sm text-navy-500">
              Try searching by name, job title, agency, or location.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                href="/agencies"
                className="rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-navy-300 transition-colors hover:bg-navy-800"
              >
                Browse Agencies
              </Link>
              <Link
                href="/states"
                className="rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-navy-300 transition-colors hover:bg-navy-800"
              >
                Browse States
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <h1 className="font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Search
      </h1>

      <div className="mt-4">
        <SearchBar size="large" />
      </div>

      <Suspense
        fallback={
          <div className="mt-8 text-center text-navy-400">Loading...</div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
