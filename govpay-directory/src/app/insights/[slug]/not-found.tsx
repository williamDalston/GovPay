import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-data text-6xl font-bold text-accent-blue">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-navy-100">
        Article Not Found
      </h1>
      <p className="mt-3 text-navy-400">
        This article doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/insights"
          className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-blue/80"
        >
          Browse Insights
        </Link>
        <Link
          href="/search"
          className="rounded-xl border border-navy-700 bg-navy-900 px-6 py-3 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-800"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
