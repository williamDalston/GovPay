export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-16 animate-shimmer rounded" />
      </div>

      <div className="h-9 w-28 animate-shimmer rounded-lg" />

      <div className="mt-4 h-14 w-full animate-pulse rounded-xl bg-navy-800" />

      <div className="mt-8">
        <div className="h-6 w-28 animate-shimmer rounded" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-navy-700 bg-navy-900 p-5"
            >
              <div className="h-5 w-40 animate-shimmer rounded" />
              <div className="mt-2 h-4 w-28 animate-shimmer rounded" />
              <div className="mt-3 flex justify-between">
                <div className="h-6 w-24 animate-shimmer rounded" />
                <div className="h-6 w-16 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
