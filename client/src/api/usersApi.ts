import usersJson from "../mock/data/users.json";
import { computeFacets, filterUsers, paginateUsers, sortUsers } from "../mock/queryEngine";
import type { User } from "../types/user";
import type { FacetsQueryParams, FacetsResult, UsersQueryParams, UsersQueryResult } from "./types";

const users = usersJson as User[];

const SIMULATED_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));
}

export async function fetchUsers(params: UsersQueryParams): Promise<UsersQueryResult> {
  const filtered = filterUsers(users, params);
  const sorted = sortUsers(filtered, params.sortField, params.sortDirection);
  const page = paginateUsers(sorted, params.page, params.pageSize);
  return delay(page);
}

export async function fetchFacets(params: FacetsQueryParams): Promise<FacetsResult> {
  return delay(computeFacets(users, params));
}
