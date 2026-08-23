import type { ReactNode } from "react";

interface HeaderProps {
  children: ReactNode;
  onOpenFilters: () => void;
}

export function Header({ children, onOpenFilters }: HeaderProps) {
  return (
    <header className="z-20 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onOpenFilters}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 lg:hidden"
        >
          Filters
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </header>
  );
}
