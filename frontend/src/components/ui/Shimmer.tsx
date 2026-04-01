const base = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

export function Shimmer({ className }: { className?: string }) {
  return <div className={`${base} ${className ?? ''}`} />;
}

export function DashboardShimmer() {
  return (
    <div className="space-y-10">
      {/* Stat Cards Shimmer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800/60 p-5 flex items-center gap-4 shadow-sm">
            <Shimmer className="h-12 w-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Shimmer className="h-2 w-12" />
              <Shimmer className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800/60 flex items-center justify-between">
            <div className="space-y-2">
              <Shimmer className="h-5 w-32" />
              <Shimmer className="h-3 w-48" />
            </div>
            <Shimmer className="h-8 w-20 rounded-xl" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-8 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Shimmer className="h-4 w-1/3" />
                    <Shimmer className="h-3 w-1/4" />
                  </div>
                </div>
                <Shimmer className="h-6 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-8">
            <Shimmer className="h-5 w-32 mb-8" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-50 dark:border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-4 flex-1">
                    <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Shimmer className="h-4 w-2/3" />
                      <Shimmer className="h-2 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Shimmer className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function ProjectsShimmer() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          {/* Top: icon + name/domain + three-dot */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Shimmer className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3 w-44" />
              </div>
            </div>
            <Shimmer className="h-5 w-5 rounded" />
          </div>
          {/* Bottom: badge + date */}
          <div className="mt-6 flex items-center justify-between">
            <Shimmer className="h-5 w-24 rounded-full" />
            <Shimmer className="h-3 w-14" />
          </div>
        </div>
      ))}
    </>
  );
}

export function BugListShimmer() {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {[...Array(6)].map((_, i) => (
        <li key={i} className="flex items-center justify-between px-4 py-5 sm:px-6 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Shimmer className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-56" />
              <Shimmer className="h-3 w-36" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Shimmer className="h-5 w-20 rounded-md" />
            <Shimmer className="h-3 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}
