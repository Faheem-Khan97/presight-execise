import type { FacetCount } from "../../types/user";

interface FacetSectionProps {
  title: string;
  facets: FacetCount[];
  selected: string[];
  onToggle: (value: string) => void;
}

const VISIBLE_ROWS = 8;

function FacetSection({
  title,
  facets,
  selected,
  onToggle,
}: FacetSectionProps) {
  const isScrollable = facets.length > VISIBLE_ROWS;

  return (
    <div>
      <h3 className="mb-2 pr-6 text-sm font-semibold text-slate-700">
        {title}
      </h3>
      <div className="relative">
        <ul
          className={`flex max-h-64 flex-col gap-1 overflow-y-auto ${isScrollable ? "pb-[16px]" : ""}`}
        >
          {facets.map((facet) => {
            const isChecked = selected.includes(facet.value);
            return (
              <li key={facet.value}>
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md py-1 pr-6 pl-2 text-sm hover:bg-slate-100">
                  <span className="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggle(facet.value)}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-slate-800 focus:ring-slate-400"
                    />
                    <span className="truncate text-slate-700">
                      {facet.value}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {facet.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {/* Height matches the ul's pb-[16px] above, so the last row can scroll clear of the fade.
            right-2.5 keeps the fade off the scrollbar gutter reserved by scrollbar-width: thin. */}
        {isScrollable && (
          <div className="pointer-events-none absolute right-2.5 bottom-0 left-0 h-[30px] bg-gradient-to-t from-white via-white/80 to-transparent" />
        )}
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  hobbyFacets: FacetCount[];
  nationalityFacets: FacetCount[];
  selectedHobbies: string[];
  selectedNationalities: string[];
  onToggleHobby: (value: string) => void;
  onToggleNationality: (value: string) => void;
}

export function FilterSidebar({
  hobbyFacets,
  nationalityFacets,
  selectedHobbies,
  selectedNationalities,
  onToggleHobby,
  onToggleNationality,
}: FilterSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <FacetSection
        title="Nationalities"
        facets={nationalityFacets}
        selected={selectedNationalities}
        onToggle={onToggleNationality}
      />
      <FacetSection
        title="Hobbies"
        facets={hobbyFacets}
        selected={selectedHobbies}
        onToggle={onToggleHobby}
      />
    </div>
  );
}
