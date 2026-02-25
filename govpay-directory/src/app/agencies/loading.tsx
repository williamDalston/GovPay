export default function AgenciesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-20 animate-shimmer rounded" />
      </div>

      <div className="h-9 w-72 animate-shimmer rounded-lg" />
      <div className="mt-3 h-5 w-96 animate-shimmer rounded" />

      <div className="mt-6 h-11 w-full max-w-md animate-pulse rounded-xl bg-navy-800" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-navy-700 bg-navy-900 p-6"
          >
            <div className="h-5 w-14 animate-shimmer rounded" />
            <div className="mt-3 h-5 w-full animate-shimmer rounded" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="h-7 w-16 animate-shimmer rounded" />
                <div className="mt-1 h-3 w-20 animate-shimmer rounded" />
              </div>
              <div>
                <div className="h-7 w-20 animate-shimmer rounded" />
                <div className="mt-1 h-3 w-20 animate-shimmer rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
