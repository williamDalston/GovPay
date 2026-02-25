import Link from "next/link";

export default function EmployeeNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-[family-name:var(--font-data)] text-6xl font-bold text-accent-blue">
        404
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100">
        Employee Not Found
      </h1>
      <p className="mt-3 text-navy-400">
        This employee record doesn&apos;t exist in our database or may have been
        removed.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/search"
          className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-blue/80"
        >
          Search Employees
        </Link>
        <Link
          href="/agencies"
          className="rounded-xl border border-navy-700 bg-navy-900 px-6 py-3 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-800"
        >
          Browse Agencies
        </Link>
      </div>
    </div>
  );
}
