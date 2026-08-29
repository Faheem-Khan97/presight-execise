import type Database from "better-sqlite3";
import type { FacetCount, FacetsResult } from "../types";
import { buildMatchingUsersFragment, type ResolvedFilters } from "./matchingUsers";

const FACET_LIMIT = 20;

function computeHobbyFacet(db: Database.Database, filters: ResolvedFilters): FacetCount[] {
  const { sql: cte, params } = buildMatchingUsersFragment(filters, { excludeHobbyFilter: true });

  return db
    .prepare(
      `WITH ${cte}
       SELECT h.name AS value, COUNT(DISTINCT uh.user_id) AS count
       FROM user_hobbies uh
       JOIN matching_users mu ON mu.id = uh.user_id
       JOIN hobbies h ON h.id = uh.hobby_id
       GROUP BY h.id
       ORDER BY count DESC, value ASC
       LIMIT ${FACET_LIMIT}`,
    )
    .all(params) as FacetCount[];
}

function computeNationalityFacet(db: Database.Database, filters: ResolvedFilters): FacetCount[] {
  const { sql: cte, params } = buildMatchingUsersFragment(filters, { excludeNationalityFilter: true });

  return db
    .prepare(
      `WITH ${cte}
       SELECT n.name AS value, COUNT(*) AS count
       FROM users u
       JOIN matching_users mu ON mu.id = u.id
       JOIN nationalities n ON n.id = u.nationality_id
       GROUP BY n.id
       ORDER BY count DESC, value ASC
       LIMIT ${FACET_LIMIT}`,
    )
    .all(params) as FacetCount[];
}

export function computeFacets(db: Database.Database, filters: ResolvedFilters): FacetsResult {
  return {
    hobbies: computeHobbyFacet(db, filters),
    nationalities: computeNationalityFacet(db, filters),
  };
}
