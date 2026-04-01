const base = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

export function Shimmer({ className }: { className?: string }) {
  return <div className={`${base} ${className ?? ''}`} />;
}

export function DashboardShimmer() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-5 flex items-center gap-4">
            <Shimmer className="h-12 w-12 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-6 w-10" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-6 space-y-4">
            <Shimmer className="h-5 w-32" />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-center justify-between py-2">
                <div className="space-y-1.5 flex-1">
                  <Shimmer className="h-3.5 w-48" />
                  <Shimmer className="h-3 w-28" />
                </div>
                <Shimmer className="h-6 w-16 rounded-full ml-4" />
              </div>
            ))}
          </div>
        ))}
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
