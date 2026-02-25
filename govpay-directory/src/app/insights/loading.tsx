export default function InsightsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-20 animate-shimmer rounded" />
      </div>

      <div className="h-9 w-56 animate-shimmer rounded-lg" />
      <div className="mt-2 h-5 w-96 animate-shimmer rounded" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-navy-700 bg-navy-900 p-6"
          >
            <div className="h-6 w-6 animate-shimmer rounded" />
            <div className="mt-4 h-5 w-44 animate-shimmer rounded" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full animate-shimmer rounded" />
              <div className="h-3 w-5/6 animate-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
