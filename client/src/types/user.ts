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
