export default function AgencyDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-20 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-40 animate-shimmer rounded" />
      </div>

      <div className="flex items-start gap-3">
        <div className="h-8 w-16 animate-shimmer rounded" />
        <div>
          <div className="h-9 w-80 animate-shimmer rounded-lg" />
          <div className="mt-2 h-5 w-40 animate-shimmer rounded" />
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-navy-700 bg-navy-900 p-4">
            <div className="h-8 w-20 animate-shimmer rounded" />
            <div className="mt-2 h-4 w-24 animate-shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
            <div className="h-5 w-40 animate-shimmer rounded" />
            <div className="mt-6 h-64 animate-shimmer rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
          <div className="h-5 w-36 animate-shimmer rounded" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-32 animate-shimmer rounded" />
                <div className="h-4 w-12 animate-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
