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

/**
 * Collapses whitespace runs to a single space so "Amara   Okafor" still matches the
 * "first last" form the SQL builds, and so spacing variants cannot fan out into
 * different result sets.
 */
function normalizeSearch(search: string | undefined): string | null {
  const normalized = search?.trim().replace(/\s+/g, " ");
  return normalized ? normalized : null;
}

function resolveFilters(db: Database.Database, { search, nationalities, hobbies }: FilterInput): ResolvedFilters {
  const reference = loadReferenceData(db);

  return {
    search: normalizeSearch(search),
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
