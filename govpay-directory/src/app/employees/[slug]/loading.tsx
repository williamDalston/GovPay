export default function EmployeeDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-20 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-32 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-36 animate-shimmer rounded" />
      </div>

      {/* Name + title */}
      <div>
        <div className="h-9 w-72 animate-shimmer rounded-lg" />
        <div className="mt-2 h-6 w-48 animate-shimmer rounded" />
        <div className="mt-3 flex gap-4">
          <div className="h-4 w-40 animate-shimmer rounded" />
          <div className="h-4 w-32 animate-shimmer rounded" />
          <div className="h-4 w-28 animate-shimmer rounded" />
          <div className="h-4 w-20 animate-shimmer rounded" />
        </div>
      </div>

      {/* Compensation + sidebar */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Compensation card */}
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
            <div className="h-4 w-40 animate-shimmer rounded" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-navy-800 p-4">
                <div className="h-3 w-28 animate-shimmer rounded" />
                <div className="mt-2 h-10 w-36 animate-shimmer rounded" />
              </div>
              <div className="rounded-lg bg-navy-800 p-4">
                <div className="h-3 w-20 animate-shimmer rounded" />
                <div className="mt-2 h-10 w-32 animate-shimmer rounded" />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-navy-800 p-4">
                  <div className="h-3 w-16 animate-shimmer rounded" />
                  <div className="mt-2 h-6 w-12 animate-shimmer rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Context card */}
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-6">
            <div className="h-4 w-44 animate-shimmer rounded" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-shimmer rounded" />
              <div className="h-4 w-full animate-shimmer rounded" />
              <div className="h-4 w-3/4 animate-shimmer rounded" />
              <div className="h-4 w-full animate-shimmer rounded" />
              <div className="h-4 w-5/6 animate-shimmer rounded" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <div className="h-5 w-44 animate-shimmer rounded" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <div className="h-3 w-28 animate-shimmer rounded" />
                    <div className="h-3 w-12 animate-shimmer rounded" />
                  </div>
                  <div className="mt-1 h-2 w-full animate-shimmer rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-navy-700 bg-navy-900 p-5">
            <div className="h-5 w-24 animate-shimmer rounded" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-44 animate-shimmer rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
