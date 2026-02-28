export default function GradeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-24 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-16 animate-shimmer rounded" />
      </div>

      {/* Nav arrows */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 animate-shimmer rounded" />
        <div className="h-4 w-16 animate-shimmer rounded" />
      </div>

      {/* Title */}
      <div className="mt-4 h-9 w-full max-w-72 animate-shimmer rounded-lg" />
      <div className="mt-2 h-5 w-full max-w-80 animate-shimmer rounded" />

      {/* Base pay table */}
      <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <div className="h-4 w-32 animate-shimmer rounded" />
        <div className="mt-4 grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:grid-cols-5 lg:grid-cols-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-navy-800 p-3">
              <div className="mx-auto h-3 w-10 animate-shimmer rounded" />
              <div className="mx-auto mt-2 h-4 w-14 animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Locality table */}
      <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <div className="h-4 w-64 max-w-full animate-shimmer rounded" />
        <div className="mt-4 space-y-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 min-w-0 flex-1 animate-shimmer rounded" />
              <div className="hidden h-4 w-16 animate-shimmer rounded sm:block" />
              <div className="h-4 w-16 shrink-0 animate-shimmer rounded sm:w-20" />
              <div className="h-4 w-16 shrink-0 animate-shimmer rounded sm:w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
