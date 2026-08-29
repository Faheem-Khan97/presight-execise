export interface User {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface FacetCount {
  value: string;
  count: number;
}

export type SortField = "first_name" | "last_name" | "age" | "nationality";
export type SortDirection = "asc" | "desc";

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
