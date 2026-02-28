export default function StatesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-4 w-32 animate-pulse rounded bg-navy-800" />
      <div className="mt-6 h-10 w-64 animate-pulse rounded bg-navy-800" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-navy-800" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-navy-700 bg-navy-900"
          />
        ))}
      </div>
    </div>
  );
}
