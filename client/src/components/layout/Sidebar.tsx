import type { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ children, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* scrollbar-gutter:auto opts out of the global `stable` rule: this column should only
          reserve scrollbar space when it actually overflows (short viewports), otherwise the
          reserved gutter leaves a visible gap beside the card's right border. */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto [scrollbar-gutter:auto] lg:block">
        <div className="rounded-xl border border-slate-200 bg-white py-4 pl-4">{children}</div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Filters</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600"
              >
                Close
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
