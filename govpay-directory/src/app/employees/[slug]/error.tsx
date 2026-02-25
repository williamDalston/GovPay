"use client";

import Link from "next/link";

export default function EmployeeError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100">
        Failed to Load Employee
      </h1>
      <p className="mt-3 text-navy-400">
        We couldn&apos;t load this employee&apos;s data. This might be a
        temporary issue.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-blue/80"
        >
          Try Again
        </button>
        <Link
          href="/search"
          className="rounded-xl border border-navy-700 bg-navy-900 px-6 py-3 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-800"
        >
          Search Employees
        </Link>
      </div>
    </div>
  );
}
