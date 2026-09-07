export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-inkwell-cream/10 bg-inkwell-900/45">
      <div className="skeleton-shimmer aspect-[16/9]" />
      <div className="space-y-4 p-6">
        <div className="skeleton-shimmer h-3 w-1/3 rounded" />
        <div className="skeleton-shimmer h-7 w-4/5 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-2/3 rounded" />
        <div className="skeleton-shimmer h-3 w-1/4 rounded" />
      </div>
    </div>
  )
}

export function BlogGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => <BlogCardSkeleton key={index} />)}
    </div>
  )
}

export function BlogDetailSkeleton() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <div className="skeleton-shimmer h-3 w-1/4 rounded" />
      <div className="skeleton-shimmer mt-6 h-16 w-11/12 rounded sm:h-24" />
      <div className="skeleton-shimmer mt-6 h-3 w-1/5 rounded" />
      <div className="skeleton-shimmer mt-12 aspect-[16/9] w-full rounded-2xl" />
      <div className="mt-8 space-y-4">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-11/12 rounded" />
        <div className="skeleton-shimmer h-4 w-4/5 rounded" />
      </div>
    </article>
  )
}
