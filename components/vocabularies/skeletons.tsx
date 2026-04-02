function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />
  );
}

export function VocabulariesListSkeleton() {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={`vocab-skeleton-${index}`}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <SkeletonBlock className="h-36 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <SkeletonBlock className="h-6 w-2/3" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
            <div className="flex flex-wrap gap-2 pt-2">
              <SkeletonBlock className="h-6 w-24 rounded-full" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-4">
              {Array.from({ length: 4 }).map((__, btnIdx) => (
                <SkeletonBlock
                  key={`vocab-btn-${btnIdx}`}
                  className="h-9 w-full"
                />
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function VocabularyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-10 w-64" />
      <SkeletonBlock className="h-56 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={`meta-${i}`} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={`word-${i}`} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function VocabularyAttemptSkeleton() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-10">
      <SkeletonBlock className="h-8 w-full rounded-lg" />
      <SkeletonBlock className="h-64 w-full rounded-xl" />
      <div className="flex w-full gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={`opt-${i}`} className="h-12 flex-1 rounded-lg" />
        ))}
      </div>
      <div className="flex w-full justify-between">
        <SkeletonBlock className="h-10 w-28 rounded-lg" />
        <SkeletonBlock className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function VocabularyResultSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
      <SkeletonBlock className="mx-auto h-24 w-24 rounded-full" />
      <SkeletonBlock className="mx-auto h-8 w-48 rounded-lg" />
      <SkeletonBlock className="mx-auto h-6 w-32 rounded-lg" />
      <div className="space-y-3">
        <SkeletonBlock className="mx-auto h-16 w-64 rounded-lg" />
        <SkeletonBlock className="mx-auto h-16 w-64 rounded-lg" />
      </div>
      <div className="flex justify-center gap-3">
        <SkeletonBlock className="h-10 w-36 rounded-lg" />
        <SkeletonBlock className="h-10 w-36 rounded-lg" />
      </div>
    </div>
  );
}

export function VocabularyReviewSkeleton() {
  return (
    <div className="space-y-4 py-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`rev-${i}`}
          className="rounded-xl border border-slate-200 bg-white p-5"
        >
          <SkeletonBlock className="mb-3 h-5 w-3/4 rounded" />
          <SkeletonBlock className="mb-2 h-4 w-full rounded" />
          <SkeletonBlock className="h-4 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

export function RecommendedVocabulariesSkeleton() {
  return (
    <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={`rec-skeleton-${index}`}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <SkeletonBlock className="h-40 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <SkeletonBlock className="h-5 w-32 rounded-full" />
            <SkeletonBlock className="h-4 w-full" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-6 w-16 rounded-full" />
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function VocabularyHistorySkeleton() {
  return (
    <div className="space-y-3 py-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBlock key={`hist-${i}`} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function VocabularyHintsSkeleton() {
  return (
    <div className="space-y-4 py-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={`hint-${i}`} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function VocabularyLeaderboardSkeleton() {
  return (
    <div className="space-y-3 py-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={`lb-${i}`} className="flex items-center gap-4">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <SkeletonBlock className="h-5 flex-1 rounded" />
          <SkeletonBlock className="h-5 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
