import type { FacetsQueryParams, FacetsResult, UsersQueryParams, UsersQueryResult } from "./types";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

type QueryValue = string | number | string[] | undefined;

/** Exported for tests: a param that is absent, blank, or whitespace-only is never sent. */
export function buildQueryString(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(key, value.join(","));
    } else {
      search.set(key, String(value));
    }
  }

  return search.toString();
}

async function fetchJson<T>(path: string, query: string): Promise<T> {
  const url = `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchUsers({
  search,
  nationalities,
  hobbies,
  sortField,
  sortDirection,
  page,
  pageSize,
}: UsersQueryParams): Promise<UsersQueryResult> {
  const query = buildQueryString({
    q: search,
    sortBy: sortField,
    sortDir: sortDirection,
    nationalities,
    hobbies,
    page,
    pageSize,
  });

  return fetchJson<UsersQueryResult>("/api/users", query);
}

export async function fetchFacets({ search, nationalities, hobbies }: FacetsQueryParams): Promise<FacetsResult> {
  const query = buildQueryString({ q: search, nationalities, hobbies });
  return fetchJson<FacetsResult>("/api/facets", query);
}
