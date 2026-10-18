import { useRef, useState } from "react";
import { useSearchDraft } from "./hooks/useSearchDraft";
import { useFacetsQuery } from "./hooks/useFacetsQuery";
import { useUrlFilters } from "./hooks/useUrlFilters";
import { useUsersInfiniteQuery } from "./hooks/useUsersInfiniteQuery";
import { toSearchQuery } from "./utils/search";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { SearchInput } from "./components/filters/SearchInput";
import { SortControls } from "./components/filters/SortControls";
import { FilterSidebar } from "./components/filters/FilterSidebar";
import { FilterSidebarSkeleton } from "./components/filters/FilterSidebarSkeleton";
import { UserList } from "./components/users/UserList";
import { LoadingState } from "./components/common/LoadingState";
import { EmptyState } from "./components/common/EmptyState";
import { ErrorState } from "./components/common/ErrorState";
const SEARCH_DEBOUNCE_MS = 300;

function App() {
  const {
    searchValue,
    selectedHobbies,
    selectedNationalities,
    sortField,
    sortDirection,
    setSearchValue,
    toggleHobby,
    toggleNationality,
    setSort,
  } = useUrlFilters();
  const [isFiltersOpen, setFiltersOpen] = useState(false);

  const { draft: searchDraft, setDraft: setSearchDraft, search } = useSearchDraft(
    searchValue,
    setSearchValue,
    SEARCH_DEBOUNCE_MS,
  );
  const searchQuery = toSearchQuery(search);

  const scrollContainerRef = useRef<HTMLElement>(null);

  const usersQuery = useUsersInfiniteQuery({
    search: searchQuery,
    nationalities: selectedNationalities,
    hobbies: selectedHobbies,
    sortField,
    sortDirection,
  });

  const facetsQuery = useFacetsQuery({
    search: searchQuery,
    nationalities: selectedNationalities,
    hobbies: selectedHobbies,
  });

  const users = usersQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Header onOpenFilters={() => setFiltersOpen(true)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Presight User Directory</h1>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="min-w-0 flex-1">
              <SearchInput value={searchDraft} onChange={setSearchDraft} />
            </div>
            <SortControls
              sortField={sortField}
              sortDirection={sortDirection}
              onChange={setSort}
            />
          </div>
        </div>
      </Header>

      {/* pl matches Header's `mx-auto max-w-7xl px-4` left edge at any viewport width, so the
          sidebar stays aligned with the header even though this row is full-bleed on the right
          (so the list's scrollbar can sit at the true edge of the screen). */}
      <div className="flex min-h-0 flex-1 gap-8 overflow-hidden bg-slate-50 py-6 pl-[max(1rem,calc((100vw-80rem)/2+1rem))]">
        <Sidebar isOpen={isFiltersOpen} onClose={() => setFiltersOpen(false)}>
          {facetsQuery.isPending ? (
            <FilterSidebarSkeleton />
          ) : (
            <FilterSidebar
              hobbyFacets={facetsQuery.data?.hobbies ?? []}
              nationalityFacets={facetsQuery.data?.nationalities ?? []}
              selectedHobbies={selectedHobbies}
              selectedNationalities={selectedNationalities}
              onToggleHobby={toggleHobby}
              onToggleNationality={toggleNationality}
            />
          )}
        </Sidebar>

        {/* pr mirrors the row's pl formula, so content's right edge lands exactly on Header's
            right edge, while the scrollbar itself still renders at main's true box edge. */}
        <main
          ref={scrollContainerRef}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto pr-[max(1rem,calc((100vw-80rem)/2+1rem))]"
        >
          <div className="pb-4">
            {usersQuery.isPending && <LoadingState />}
            {usersQuery.isError && <ErrorState onRetry={() => usersQuery.refetch()} />}
            {usersQuery.isSuccess && users.length === 0 && <EmptyState />}
            {usersQuery.isSuccess && users.length > 0 && (
              <UserList
                users={users}
                hasNextPage={usersQuery.hasNextPage ?? false}
                isFetchingNextPage={usersQuery.isFetchingNextPage}
                onLoadMore={() => usersQuery.fetchNextPage()}
                scrollElementRef={scrollContainerRef}
                selectedHobbies={selectedHobbies}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
