const SKELETON_ROWS = 8;
const ROW_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-36", "w-24", "w-30", "w-28"];

/**
 * Mirrors FacetSection's box model exactly: each row wrapper is given text-sm's line-height
 * (20px) as an explicit height, matching the real `<label>` row height (28px with its py-1).
 * The row list uses a fixed h-64 (not max-h-64) because the real list always has more than
 * 8 facets in practice and hits its max-h-64 cap, so h-64 reproduces that steady-state height.
 */
function FacetSectionSkeleton() {
  return (
    <div>
      <div className="mb-2 flex h-5 items-center">
        <div className="h-4 w-24 rounded bg-slate-200" />
      </div>
      <div className="flex h-64 flex-col gap-1 overflow-hidden">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-2 py-1 pr-6 pl-2">
            <div className="flex h-5 min-w-0 items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-slate-200" />
              <div className={`h-3.5 rounded bg-slate-100 ${ROW_WIDTHS[index % ROW_WIDTHS.length]}`} />
            </div>
            <div className="flex h-5 w-6 shrink-0 items-center">
              <div className="h-3 w-full rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors FilterSidebar's two-section layout while facet counts are loading. */
export function FilterSidebarSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <FacetSectionSkeleton />
      <FacetSectionSkeleton />
    </div>
  );
}
