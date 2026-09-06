import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useUrlFilters } from "./useUrlFilters";

function wrapper(initialEntry: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
}

/** Renders both useUrlFilters and the raw search params, so tests can assert on the URL itself. */
function renderWithSearchParams(initialEntry = "/") {
  return renderHook(
    () => {
      const filters = useUrlFilters();
      const [searchParams] = useSearchParams();
      return { filters, searchParams };
    },
    { wrapper: wrapper(initialEntry) },
  );
}

describe("useUrlFilters - reading from the URL", () => {
  it("defaults to empty search, no filters, and first_name/asc sort when the URL has no params", () => {
    const { result } = renderWithSearchParams("/");
    expect(result.current.filters.searchValue).toBe("");
    expect(result.current.filters.selectedHobbies).toEqual([]);
    expect(result.current.filters.selectedNationalities).toEqual([]);
    expect(result.current.filters.sortField).toBe("first_name");
    expect(result.current.filters.sortDirection).toBe("asc");
  });

  it("restores all five pieces of state from an existing URL query string", () => {
    const { result } = renderWithSearchParams(
      "/?q=amara&hobbies=Chess%2CHiking&nationalities=Nigerian%2CKenyan&sortBy=age&sortDir=desc",
    );

    expect(result.current.filters.searchValue).toBe("amara");
    expect(result.current.filters.selectedHobbies).toEqual(["Chess", "Hiking"]);
    expect(result.current.filters.selectedNationalities).toEqual(["Nigerian", "Kenyan"]);
    expect(result.current.filters.sortField).toBe("age");
    expect(result.current.filters.sortDirection).toBe("desc");
  });
});

describe("useUrlFilters - writing to the URL", () => {
  it("setSearchValue writes q and omits it entirely when cleared", () => {
    const { result } = renderWithSearchParams("/");

    act(() => result.current.filters.setSearchValue("lucas"));
    expect(result.current.searchParams.get("q")).toBe("lucas");

    act(() => result.current.filters.setSearchValue(""));
    expect(result.current.searchParams.has("q")).toBe(false);
  });

  it("toggleHobby adds a hobby, then removes it again on a second toggle", () => {
    const { result } = renderWithSearchParams("/");

    act(() => result.current.filters.toggleHobby("Chess"));
    expect(result.current.filters.selectedHobbies).toEqual(["Chess"]);
    expect(result.current.searchParams.get("hobbies")).toBe("Chess");

    act(() => result.current.filters.toggleHobby("Hiking"));
    expect(result.current.filters.selectedHobbies).toEqual(["Chess", "Hiking"]);

    act(() => result.current.filters.toggleHobby("Chess"));
    expect(result.current.filters.selectedHobbies).toEqual(["Hiking"]);
  });

  it("toggleNationality removes the param entirely once the last selection is cleared", () => {
    const { result } = renderWithSearchParams("/");

    act(() => result.current.filters.toggleNationality("Nigerian"));
    act(() => result.current.filters.toggleNationality("Nigerian"));

    expect(result.current.filters.selectedNationalities).toEqual([]);
    expect(result.current.searchParams.has("nationalities")).toBe(false);
  });

  it("setSort writes both sortBy and sortDir together", () => {
    const { result } = renderWithSearchParams("/");

    act(() => result.current.filters.setSort("nationality", "desc"));

    expect(result.current.filters.sortField).toBe("nationality");
    expect(result.current.filters.sortDirection).toBe("desc");
    expect(result.current.searchParams.get("sortBy")).toBe("nationality");
    expect(result.current.searchParams.get("sortDir")).toBe("desc");
  });

  it("changing one filter does not clobber the others already in the URL", () => {
    const { result } = renderWithSearchParams("/?q=amara&sortBy=age&sortDir=desc");

    act(() => result.current.filters.toggleHobby("Chess"));

    expect(result.current.filters.searchValue).toBe("amara");
    expect(result.current.filters.sortField).toBe("age");
    expect(result.current.filters.sortDirection).toBe("desc");
    expect(result.current.filters.selectedHobbies).toEqual(["Chess"]);
  });
});
