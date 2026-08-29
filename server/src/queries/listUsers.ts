import type Database from "better-sqlite3";
import type { SortDirection, SortField, User, UsersQueryResult } from "../types";
import { buildMatchingUsersFragment, type ResolvedFilters } from "./matchingUsers";

/** Allow-list: never interpolate a sort field straight from user input into SQL. */
const SORT_COLUMNS: Record<SortField, string> = {
  first_name: "u.first_name",
  last_name: "u.last_name",
  age: "u.age",
  nationality: "n.name",
};

interface UserRow {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
}

function fetchHobbiesForUsers(db: Database.Database, userIds: number[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  if (userIds.length === 0) return map;

  const rows = db
    .prepare(
      `SELECT uh.user_id AS userId, h.name AS name
       FROM user_hobbies uh
       JOIN hobbies h ON h.id = uh.hobby_id
       WHERE uh.user_id IN (SELECT value FROM json_each(@userIds))`,
    )
    .all({ userIds: JSON.stringify(userIds) }) as { userId: number; name: string }[];

  for (const row of rows) {
    const list = map.get(row.userId) ?? [];
    list.push(row.name);
    map.set(row.userId, list);
  }
  return map;
}

export function listUsers(
  db: Database.Database,
  filters: ResolvedFilters,
  sortField: SortField,
  sortDirection: SortDirection,
  page: number,
  pageSize: number,
): UsersQueryResult {
  const { sql: cte, params: cteParams } = buildMatchingUsersFragment(filters);
  const sortColumn = SORT_COLUMNS[sortField];
  const direction = sortDirection === "desc" ? "DESC" : "ASC";
  const offset = (page - 1) * pageSize;

  const total = (
    db.prepare(`WITH ${cte} SELECT COUNT(*) AS count FROM matching_users`).get(cteParams) as { count: number }
  ).count;

  const rows = db
    .prepare(
      `WITH ${cte}
       SELECT u.id, u.avatar, u.first_name, u.last_name, u.age, n.name AS nationality
       FROM users u
       JOIN matching_users mu ON mu.id = u.id
       JOIN nationalities n ON n.id = u.nationality_id
       ORDER BY ${sortColumn} ${direction}, u.id ASC
       LIMIT @limit OFFSET @offset`,
    )
    .all({ ...cteParams, limit: pageSize, offset }) as UserRow[];

  const hobbiesByUser = fetchHobbiesForUsers(
    db,
    rows.map((row) => row.id),
  );

  const data: User[] = rows.map((row) => ({
    ...row,
    hobbies: hobbiesByUser.get(row.id) ?? [],
  }));

  return {
    data,
    page,
    pageSize,
    hasMore: offset + data.length < total,
    total,
  };
}
