import { useEffect, useRef, useState } from "react";
import type { SortDirection, SortField } from "../../types/user";

interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { field: "first_name", direction: "asc", label: "First name (A–Z)" },
  { field: "first_name", direction: "desc", label: "First name (Z–A)" },
  { field: "last_name", direction: "asc", label: "Last name (A–Z)" },
  { field: "last_name", direction: "desc", label: "Last name (Z–A)" },
  { field: "age", direction: "asc", label: "Age (Youngest first)" },
  { field: "age", direction: "desc", label: "Age (Oldest first)" },
  { field: "nationality", direction: "asc", label: "Nationality (A–Z)" },
  { field: "nationality", direction: "desc", label: "Nationality (Z–A)" },
];

interface SortControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onChange: (field: SortField, direction: SortDirection) => void;
}

export function SortControls({
  sortField,
  sortDirection,
  onChange,
}: SortControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    SORT_OPTIONS.find(
      (option) =>
        option.field === sortField && option.direction === sortDirection,
    ) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 sm:w-56"
      >
        <span className="shrink-0 text-slate-400">Sort:</span>
        <span className="min-w-0 flex-1 truncate text-left font-medium">
          {activeOption.label}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="menu"
          className="absolute right-0 z-10 mt-1 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected =
              option.field === sortField && option.direction === sortDirection;
            return (
              <li key={`${option.field}-${option.direction}`} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-current={isSelected}
                  onClick={() => {
                    onChange(option.field, option.direction);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                    isSelected
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
