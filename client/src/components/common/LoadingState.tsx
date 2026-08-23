const SKELETON_ROWS = 6;

/**
 * Mirrors UserCard's box model exactly (not just its visual shape): each text-size wrapper is
 * given the real element's line-height as an explicit height, so the skeleton stack is exactly
 * as tall as the real list would be and swapping in real data causes no layout shift.
 */
export function LoadingState() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* h-6 matches the name's default text line-height (24px) */}
            <div className="flex h-6 items-center">
              <div className="h-4 w-40 max-w-[60%] rounded bg-slate-200" />
            </div>
            {/* h-5 matches text-sm's line-height (20px) */}
            <div className="flex h-5 items-center justify-between gap-2">
              <div className="h-3.5 w-24 rounded bg-slate-100" />
              <div className="h-3.5 w-6 rounded bg-slate-100" />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <div className="h-5 w-16 rounded-full bg-slate-100" />
              <div className="h-5 w-20 rounded-full bg-slate-100" />
              <div className="h-5 w-8 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
