"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-[family-name:var(--font-data)] text-6xl font-bold text-accent-red">
        500
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-navy-100 sm:text-3xl">
        Something Went Wrong
      </h1>
      <p className="mt-3 text-navy-400">
        An unexpected error occurred. This might be a temporary issue with
        our data service.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-blue/80"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-navy-700 bg-navy-900 px-6 py-3 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-800"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
