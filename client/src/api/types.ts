import type { FacetCount, SortDirection, SortField, User } from "../types/user";

export interface UsersQueryParams {
  search?: string;
  nationalities?: string[];
  hobbies?: string[];
  sortField: SortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
}

export interface UsersQueryResult {
  data: User[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
}

export interface FacetsQueryParams {
  search?: string;
  nationalities?: string[];
  hobbies?: string[];
}

export interface FacetsResult {
  hobbies: FacetCount[];
  nationalities: FacetCount[];
}
