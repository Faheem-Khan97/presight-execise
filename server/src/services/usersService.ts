import type Database from "better-sqlite3";
import { computeFacets } from "../queries/facets";
import { listUsers } from "../queries/listUsers";
import type { ResolvedFilters } from "../queries/matchingUsers";
import type { FacetsQueryParams, FacetsResult, UsersQueryParams, UsersQueryResult } from "../types";
import { loadReferenceData, resolveNames } from "./referenceData";

interface FilterInput {
  search?: string;
  nationalities?: string[];
  hobbies?: string[];
}

function resolveFilters(db: Database.Database, { search, nationalities, hobbies }: FilterInput): ResolvedFilters {
  const reference = loadReferenceData(db);
  const trimmedSearch = search?.trim();

  return {
    search: trimmedSearch ? trimmedSearch : null,
    nationalityIds: resolveNames(nationalities ?? [], reference.nationalityIdByName),
    hobbyIds: resolveNames(hobbies ?? [], reference.hobbyIdByName),
  };
}

export function getUsers(db: Database.Database, params: UsersQueryParams): UsersQueryResult {
  const { sortField, sortDirection, page, pageSize } = params;
  const filters = resolveFilters(db, params);
  return listUsers(db, filters, sortField, sortDirection, page, pageSize);
}

export function getFacets(db: Database.Database, params: FacetsQueryParams): FacetsResult {
  const filters = resolveFilters(db, params);
  return computeFacets(db, filters);
}
