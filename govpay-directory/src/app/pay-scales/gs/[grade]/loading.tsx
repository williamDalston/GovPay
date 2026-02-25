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
      <div className="mt-4 h-9 w-72 animate-shimmer rounded-lg" />
      <div className="mt-2 h-5 w-80 animate-shimmer rounded" />

      {/* Base pay table */}
      <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-6">
        <div className="h-4 w-32 animate-shimmer rounded" />
        <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-10">
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
        <div className="h-4 w-64 animate-shimmer rounded" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-48 animate-shimmer rounded" />
              <div className="h-4 w-16 animate-shimmer rounded" />
              <div className="h-4 w-20 animate-shimmer rounded" />
              <div className="h-4 w-20 animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
