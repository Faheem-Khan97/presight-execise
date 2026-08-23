import type { FacetCount, SortDirection, SortField, User } from "../types/user";

export interface FilterParams {
  search?: string;
  nationalities?: string[];
  hobbies?: string[];
}

export interface PaginatedResult {
  data: User[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
}

export interface FacetsResult {
  hobbies: FacetCount[];
  nationalities: FacetCount[];
}

const TOP_FACETS_LIMIT = 20;

export function filterUsers(users: User[], params: FilterParams): User[] {
  const search = params.search?.trim().toLowerCase();
  const nationalities = params.nationalities ?? [];
  const hobbies = params.hobbies ?? [];

  return users.filter((user) => {
    if (search) {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      if (
        !user.first_name.toLowerCase().includes(search) &&
        !user.last_name.toLowerCase().includes(search) &&
        !fullName.includes(search)
      ) {
        return false;
      }
    }

    if (nationalities.length > 0 && !nationalities.includes(user.nationality)) {
      return false;
    }

    if (hobbies.length > 0 && !hobbies.every((hobby) => user.hobbies.includes(hobby))) {
      return false;
    }

    return true;
  });
}

export function sortUsers(users: User[], sortField: SortField, sortDirection: SortDirection): User[] {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...users].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    let comparison: number;
    if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    if (comparison !== 0) {
      return comparison * direction;
    }

    return a.id - b.id;
  });
}

export function paginateUsers(users: User[], page: number, pageSize: number): PaginatedResult {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: users.slice(start, end),
    page,
    pageSize,
    hasMore: end < users.length,
    total: users.length,
  };
}

function topFacetCounts(users: User[], extractValues: (user: User) => string[]): FacetCount[] {
  const counts = new Map<string, number>();

  for (const user of users) {
    for (const value of extractValues(user)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, TOP_FACETS_LIMIT);
}

export function computeFacets(users: User[], params: FilterParams): FacetsResult {
  const usersForHobbyCounts = filterUsers(users, { search: params.search, nationalities: params.nationalities });
  const usersForNationalityCounts = filterUsers(users, { search: params.search, hobbies: params.hobbies });

  return {
    hobbies: topFacetCounts(usersForHobbyCounts, (user) => user.hobbies),
    nationalities: topFacetCounts(usersForNationalityCounts, (user) => [user.nationality]),
  };
}
