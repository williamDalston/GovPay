export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-16 animate-shimmer rounded" />
      </div>

      <div className="h-9 w-64 animate-shimmer rounded-lg" />
      <div className="mt-3 h-6 w-96 animate-shimmer rounded" />

      {/* Mission section */}
      <div className="mt-10">
        <div className="h-6 w-32 animate-shimmer rounded" />
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full animate-shimmer rounded" />
          <div className="h-4 w-full animate-shimmer rounded" />
          <div className="h-4 w-3/4 animate-shimmer rounded" />
        </div>
      </div>

      {/* Data sources cards */}
      <div className="mt-10">
        <div className="h-6 w-36 animate-shimmer rounded" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-navy-700 bg-navy-900 p-5"
            >
              <div className="h-4 w-32 animate-shimmer rounded" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full animate-shimmer rounded" />
                <div className="h-3 w-5/6 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
