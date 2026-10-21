export interface ResolvedFilters {
  search: string | null;
  nationalityIds: number[];
  hobbyIds: number[];
}

export interface MatchingUsersOptions {
  excludeHobbyFilter?: boolean;
  excludeNationalityFilter?: boolean;
}

export interface MatchingUsersFragment {
  /** A `WITH <this>` fragment defining `matching_users(id)` — the filtered candidate set. */
  sql: string;
  params: Record<string, string | number | null>;
}

/**
 * Builds the one reusable "which users match the current filters" fragment, shared by the
 * list query, its count, and both facet queries.
 *
 * Search matches either name on its own, and also the full name in both orders, so
 * "Amara Okafor" and "Okafor Amara" both find the same person. A single-word search is
 * unaffected by the concatenated forms: with no space in the pattern it cannot straddle the
 * joining space. Hobbies use relational division
 * (GROUP BY ... HAVING COUNT = N) so a user must have ALL selected hobbies; nationalities use
 * a plain IN-list so a user matching ANY selected nationality counts.
 *
 * `excludeHobbyFilter`/`excludeNationalityFilter` let a facet query ask "who matches everything
 * except this one dimension" — the "exclude the facet's own dimension" rule the sidebar counts
 * rely on.
 */
export function buildMatchingUsersFragment(
  filters: ResolvedFilters,
  options: MatchingUsersOptions = {},
): MatchingUsersFragment {
  const nationalityIds = options.excludeNationalityFilter ? [] : filters.nationalityIds;
  const hobbyIds = options.excludeHobbyFilter ? [] : filters.hobbyIds;

  const sql = `
    matching_users AS (
      SELECT u.id
      FROM users u
      WHERE (@search IS NULL
             OR u.first_name LIKE @pattern
             OR u.last_name LIKE @pattern
             OR (u.first_name || ' ' || u.last_name) LIKE @pattern
             OR (u.last_name || ' ' || u.first_name) LIKE @pattern)
        AND (@nationalityCount = 0 OR u.nationality_id IN (SELECT value FROM json_each(@nationalityIds)))
        AND (@hobbyCount = 0 OR u.id IN (
          SELECT uh.user_id FROM user_hobbies uh
          WHERE uh.hobby_id IN (SELECT value FROM json_each(@hobbyIds))
          GROUP BY uh.user_id
          HAVING COUNT(DISTINCT uh.hobby_id) = @hobbyCount
        ))
    )
  `;

  return {
    sql,
    params: {
      search: filters.search,
      pattern: filters.search ? `%${filters.search}%` : null,
      nationalityCount: nationalityIds.length,
      nationalityIds: JSON.stringify(nationalityIds),
      hobbyCount: hobbyIds.length,
      hobbyIds: JSON.stringify(hobbyIds),
    },
  };
}
