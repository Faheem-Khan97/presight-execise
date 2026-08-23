import { useSearchParams } from "react-router-dom";
import type { SortDirection, SortField } from "../types/user";

const DEFAULT_SORT_FIELD: SortField = "first_name";
const DEFAULT_SORT_DIRECTION: SortDirection = "asc";

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchValue = searchParams.get("q") ?? "";
  const selectedHobbies = parseList(searchParams.get("hobbies"));
  const selectedNationalities = parseList(searchParams.get("nationalities"));
  const sortField = (searchParams.get("sortBy") as SortField | null) ?? DEFAULT_SORT_FIELD;
  const sortDirection = (searchParams.get("sortDir") as SortDirection | null) ?? DEFAULT_SORT_DIRECTION;

  function updateParams(mutate: (params: URLSearchParams) => void) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        mutate(next);
        return next;
      },
      { replace: true },
    );
  }

  function setSearchValue(value: string) {
    updateParams((params) => {
      if (value) params.set("q", value);
      else params.delete("q");
    });
  }

  function toggleHobby(value: string) {
    updateParams((params) => {
      const next = toggleInList(parseList(params.get("hobbies")), value);
      if (next.length > 0) params.set("hobbies", next.join(","));
      else params.delete("hobbies");
    });
  }

  function toggleNationality(value: string) {
    updateParams((params) => {
      const next = toggleInList(parseList(params.get("nationalities")), value);
      if (next.length > 0) params.set("nationalities", next.join(","));
      else params.delete("nationalities");
    });
  }

  function setSort(field: SortField, direction: SortDirection) {
    updateParams((params) => {
      params.set("sortBy", field);
      params.set("sortDir", direction);
    });
  }

  return {
    searchValue,
    selectedHobbies,
    selectedNationalities,
    sortField,
    sortDirection,
    setSearchValue,
    toggleHobby,
    toggleNationality,
    setSort,
  };
}
