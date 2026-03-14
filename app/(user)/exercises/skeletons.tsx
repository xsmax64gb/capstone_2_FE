function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />;
}

export function ExercisesListSkeleton() {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={`exercise-skeleton-${index}`}
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
              <SkeletonBlock className="h-6 w-28 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-4">
              {Array.from({ length: 4 }).map((__, buttonIndex) => (
                <SkeletonBlock
                  key={`exercise-button-skeleton-${buttonIndex}`}
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

export function RecommendedSkeleton() {
  return (
    <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={`recommended-skeleton-${index}`}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <SkeletonBlock className="h-40 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <SkeletonBlock className="h-5 w-32 rounded-full" />
            <SkeletonBlock className="h-6 w-3/4" />
            <SkeletonBlock className="h-4 w-full" />
            <div className="flex gap-2 pt-2">
              <SkeletonBlock className="h-8 w-20" />
              <SkeletonBlock className="h-8 w-24" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function HistorySkeleton() {
  return (
    <section className="mb-6 space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={`history-skeleton-${index}`}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-1/2" />
            <SkeletonBlock className="h-4 w-1/3" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
          <div className="mt-4 flex gap-2">
            <SkeletonBlock className="h-8 w-24" />
            <SkeletonBlock className="h-8 w-20" />
          </div>
        </article>
      ))}
    </section>
  );
}

export function ExerciseDetailSkeleton() {
  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SkeletonBlock className="h-44 w-full rounded-none" />
        <div className="space-y-3 p-6">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-8 w-1/2" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SkeletonBlock className="mb-4 h-6 w-40" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SkeletonBlock className="h-6 w-44" />
            <div className="mt-3 space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <SkeletonBlock className="h-48 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </section>
  );
}

export function AttemptSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SkeletonBlock className="h-6 w-1/2" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
        <div className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-2">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      </section>
    </main>
  );
}

export function HintsSkeleton() {
  return (
    <section className="mb-6 space-y-4">
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SkeletonBlock className="h-5 w-44" />
        <div className="mt-3 space-y-2">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-5/6" />
        </div>
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SkeletonBlock className="h-5 w-40" />
        <div className="mt-3 space-y-2">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-4/5" />
        </div>
      </article>
    </section>
  );
}

export function LeaderboardSkeleton() {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`leaderboard-skeleton-${index}`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-3 w-14" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-4 w-14" />
                <SkeletonBlock className="h-4 w-12" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ResultSkeleton() {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-28" />
        </div>
        <SkeletonBlock className="h-20 w-32 rounded-xl" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
      </div>
      <div className="flex gap-2 border-t border-slate-100 pt-5">
        <SkeletonBlock className="h-9 w-32" />
        <SkeletonBlock className="h-9 w-32" />
        <SkeletonBlock className="h-9 w-36" />
      </div>
    </section>
  );
}

export function ReviewSkeleton() {
  return (
    <section className="mb-6 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <article
          key={`review-skeleton-${index}`}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-14 w-full" />
          </div>
        </article>
      ))}
    </section>
  );
}
