export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-16 animate-shimmer rounded" />
        <div className="h-4 w-4 animate-shimmer rounded" />
        <div className="h-4 w-48 animate-shimmer rounded" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-6 w-24 animate-shimmer rounded-full" />
          <div className="mt-3 h-10 w-full animate-shimmer rounded-lg" />
          <div className="mt-3 h-5 w-3/4 animate-shimmer rounded" />
          <div className="mt-4 flex gap-4">
            <div className="h-4 w-32 animate-shimmer rounded" />
            <div className="h-4 w-24 animate-shimmer rounded" />
          </div>

          <div className="mt-8 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-6 w-64 animate-shimmer rounded" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-full animate-shimmer rounded" />
                  <div className="h-4 w-full animate-shimmer rounded" />
                  <div className="h-4 w-3/4 animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-48 animate-shimmer rounded-xl" />
          <div className="h-32 animate-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}
