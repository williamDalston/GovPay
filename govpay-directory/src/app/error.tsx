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
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
      <p className="font-data text-5xl font-bold text-accent-red sm:text-6xl">
        500
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-navy-100 sm:text-3xl">
        Something Went Wrong
      </h1>
      <p className="mt-3 text-sm text-navy-400 sm:text-base">
        An unexpected error occurred. This might be a temporary issue with
        our data service.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          onClick={() => reset()}
          className="w-full rounded-xl bg-accent-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-blue/80 active:scale-[0.98] sm:w-auto"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="w-full rounded-xl border border-navy-700 bg-navy-900 px-6 py-3 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-800 active:scale-[0.98] sm:w-auto"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
