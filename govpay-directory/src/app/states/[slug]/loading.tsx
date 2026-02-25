export default function StateDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-16 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-24 animate-shimmer rounded" />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-shimmer rounded-lg" />
        <div>
          <div className="h-9 w-48 animate-shimmer rounded-lg" />
          <div className="mt-2 h-5 w-56 animate-shimmer rounded" />
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-navy-700 bg-navy-900 p-4">
            <div className="h-8 w-20 animate-shimmer rounded" />
            <div className="mt-2 h-4 w-28 animate-shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Agency list skeleton */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
            <div className="h-5 w-52 animate-shimmer rounded" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <div className="h-5 w-48 animate-shimmer rounded" />
                  <div className="h-5 w-24 animate-shimmer rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
          <div className="h-5 w-28 animate-shimmer rounded" />
          <div className="mt-4 space-y-2">
            <div className="h-10 w-full animate-shimmer rounded-lg" />
            <div className="h-10 w-full animate-shimmer rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
