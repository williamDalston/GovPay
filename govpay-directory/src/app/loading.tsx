export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-20 animate-shimmer rounded" />
      </div>

      {/* Title skeleton */}
      <div className="h-9 w-full max-w-80 animate-shimmer rounded-lg" />
      <div className="mt-3 h-5 w-full max-w-96 animate-shimmer rounded" />

      {/* Card grid skeleton */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-navy-700 bg-navy-900 p-6"
          >
            <div className="h-4 w-16 animate-shimmer rounded" />
            <div className="mt-3 h-5 w-full animate-shimmer rounded" />
            <div className="mt-4 flex justify-between">
              <div className="h-8 w-20 animate-shimmer rounded" />
              <div className="h-8 w-24 animate-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
