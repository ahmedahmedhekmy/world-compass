/**
 * Full-page loading state with skeleton animation.
 * Use this for route-level loading states.
 */
export function PageLoading() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      </div>
    </div>
  );
}

/**
 * Section loading skeleton - for individual components.
 */
export function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-secondary"
          style={{ width: `${85 + Math.random() * 15}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for grid layouts.
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-border">
      <div className="aspect-[4/3] bg-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded bg-secondary" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-secondary" />
          <div className="h-3 w-4/5 rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table row skeleton for data tables.
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse border-t border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 w-full rounded bg-secondary" />
        </td>
      ))}
    </tr>
  );
}
