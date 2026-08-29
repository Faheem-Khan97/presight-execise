import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import { migrate } from "../src/db/migrate";
import { getFacets, getUsers } from "../src/services/usersService";
import { resetReferenceDataCache } from "../src/services/referenceData";
import type { SortDirection, SortField, UsersQueryParams } from "../src/types";

interface FixtureUser {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

function seedFixture(db: Database.Database, users: FixtureUser[]): void {
  migrate(db);
  resetReferenceDataCache();
  db.exec("DELETE FROM user_hobbies; DELETE FROM users; DELETE FROM hobbies; DELETE FROM nationalities;");

  const nationalities = [...new Set(users.map((u) => u.nationality))];
  const hobbies = [...new Set(users.flatMap((u) => u.hobbies))];

  const nationalityIds = new Map<string, number>();
  nationalities.forEach((name, index) => {
    db.prepare("INSERT INTO nationalities (id, name) VALUES (?, ?)").run(index + 1, name);
    nationalityIds.set(name, index + 1);
  });

  const hobbyIds = new Map<string, number>();
  hobbies.forEach((name, index) => {
    db.prepare("INSERT INTO hobbies (id, name) VALUES (?, ?)").run(index + 1, name);
    hobbyIds.set(name, index + 1);
  });

  const insertUser = db.prepare(
    "INSERT INTO users (id, avatar, first_name, last_name, age, nationality_id) VALUES (?, '', ?, ?, ?, ?)",
  );
  const insertUserHobby = db.prepare("INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)");

  for (const user of users) {
    insertUser.run(user.id, user.first_name, user.last_name, user.age, nationalityIds.get(user.nationality)!);
    for (const hobby of user.hobbies) {
      insertUserHobby.run(user.id, hobbyIds.get(hobby)!);
    }
  }
}

const FIXTURE_USERS: FixtureUser[] = [
  { id: 1, first_name: "Amara", last_name: "Okafor", age: 29, nationality: "Nigerian", hobbies: ["Chess", "Hiking"] },
  { id: 2, first_name: "Lucas", last_name: "Silva", age: 34, nationality: "Brazilian", hobbies: ["Surfing", "Cooking"] },
  { id: 3, first_name: "Amara", last_name: "Diallo", age: 29, nationality: "Nigerian", hobbies: ["Chess"] },
  { id: 4, first_name: "Chidi", last_name: "Okafor", age: 41, nationality: "Nigerian", hobbies: ["Hiking", "Cooking"] },
  { id: 5, first_name: "Elif", last_name: "Yildiz", age: 22, nationality: "Turkish", hobbies: [] },
];

let db: Database.Database;

beforeEach(() => {
  db = new Database(":memory:");
});

function query(overrides: Partial<UsersQueryParams> = {}) {
  const params: UsersQueryParams = {
    sortField: "first_name" as SortField,
    sortDirection: "asc" as SortDirection,
    page: 1,
    pageSize: 50,
    ...overrides,
  };
  return getUsers(db, params);
}

describe("getUsers - filtering", () => {
  beforeEach(() => seedFixture(db, FIXTURE_USERS));

  it("matches search text against first or last name, case-insensitively", () => {
    const result = query({ search: "okafor" });
    expect(result.data.map((u) => u.id)).toEqual([1, 4]);
  });

  it("matches nationalities with OR semantics", () => {
    const result = query({ nationalities: ["Brazilian", "Turkish"] });
    expect(result.data.map((u) => u.id).sort((a, b) => a - b)).toEqual([2, 5]);
  });

  it("matches hobbies with AND semantics (must have all selected hobbies)", () => {
    const result = query({ hobbies: ["Hiking", "Cooking"] });
    expect(result.data.map((u) => u.id)).toEqual([4]);
  });

  it("combines search, hobbies, and nationality filters with AND", () => {
    const result = query({ search: "amara", nationalities: ["Nigerian"], hobbies: ["Chess"] });
    expect(result.data.map((u) => u.id)).toEqual([1, 3]);
  });

  it("returns everyone when no filters are applied", () => {
    expect(query().total).toBe(5);
  });

  it("ignores unknown nationality/hobby names instead of erroring", () => {
    const result = query({ nationalities: ["Atlantean"], hobbies: ["Telepathy"] });
    expect(result.total).toBe(0);
    expect(() => query({ nationalities: ["Atlantean"] })).not.toThrow();
  });
});

describe("getUsers - sorting", () => {
  beforeEach(() => seedFixture(db, FIXTURE_USERS));

  it("sorts by the given field ascending", () => {
    const result = query({ sortField: "age", sortDirection: "asc" });
    expect(result.data.map((u) => u.age)).toEqual([22, 29, 29, 34, 41]);
  });

  it("sorts by the given field descending", () => {
    const result = query({ sortField: "last_name", sortDirection: "desc" });
    expect(result.data.map((u) => u.last_name)).toEqual(["Yildiz", "Silva", "Okafor", "Okafor", "Diallo"]);
  });

  it("uses id as a deterministic tie-breaker when sort values are equal", () => {
    const result = query({ sortField: "age", sortDirection: "asc" });
    const tiedAgeUsers = result.data.filter((u) => u.age === 29);
    expect(tiedAgeUsers.map((u) => u.id)).toEqual([1, 3]);
  });

  it("sorts by the normalized nationality name via its join", () => {
    const result = query({ sortField: "nationality", sortDirection: "asc" });
    expect(result.data.map((u) => u.nationality)).toEqual([
      "Brazilian",
      "Nigerian",
      "Nigerian",
      "Nigerian",
      "Turkish",
    ]);
  });
});

describe("getUsers - pagination", () => {
  beforeEach(() => seedFixture(db, FIXTURE_USERS));

  // Sorted by age asc (tie-break id): [5, 1, 3, 2, 4] — see "getUsers - sorting" for the sort
  // assertion itself; these tests only care about pagination mechanics against that fixed order.

  it("slices results for the requested page", () => {
    const result = query({ page: 1, pageSize: 2, sortField: "age" });
    expect(result.data.map((u) => u.id)).toEqual([5, 1]);
    expect(result.total).toBe(5);
  });

  it("reports hasMore=true when more pages remain", () => {
    expect(query({ page: 1, pageSize: 2, sortField: "age" }).hasMore).toBe(true);
  });

  it("reports hasMore=false on the last page", () => {
    const result = query({ page: 3, pageSize: 2, sortField: "age" });
    expect(result.data.map((u) => u.id)).toEqual([4]);
    expect(result.hasMore).toBe(false);
  });

  it("returns an empty page past the end without error", () => {
    const result = query({ page: 10, pageSize: 2 });
    expect(result.data).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  it("returns no duplicate or missing users across consecutive pages", () => {
    const page1 = query({ page: 1, pageSize: 2 }).data.map((u) => u.id);
    const page2 = query({ page: 2, pageSize: 2 }).data.map((u) => u.id);
    const page3 = query({ page: 3, pageSize: 2 }).data.map((u) => u.id);
    const combined = [...page1, ...page2, ...page3].sort((a, b) => a - b);
    expect(combined).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("getUsers - hobbies on returned rows", () => {
  beforeEach(() => seedFixture(db, FIXTURE_USERS));

  it("attaches each user's own hobby list without leaking others'", () => {
    const result = query({ page: 1, pageSize: 5 });
    const byId = new Map(result.data.map((u) => [u.id, u.hobbies]));
    expect(byId.get(1)?.sort()).toEqual(["Chess", "Hiking"]);
    expect(byId.get(5)).toEqual([]);
  });
});

describe("getFacets", () => {
  beforeEach(() => seedFixture(db, FIXTURE_USERS));

  function facets(overrides: Partial<{ search: string; nationalities: string[]; hobbies: string[] }> = {}) {
    return getFacets(db, overrides);
  }

  it("counts hobbies ignoring the active hobby filter but respecting other filters", () => {
    const result = facets({ nationalities: ["Nigerian"], hobbies: ["Chess"] });
    const chess = result.hobbies.find((f) => f.value === "Chess");
    const hiking = result.hobbies.find((f) => f.value === "Hiking");
    expect(chess?.count).toBe(2);
    expect(hiking?.count).toBe(2);
  });

  it("counts nationalities ignoring the active nationality filter but respecting other filters", () => {
    const result = facets({ nationalities: ["Nigerian"], hobbies: ["Chess"] });
    const nigerian = result.nationalities.find((f) => f.value === "Nigerian");
    const brazilian = result.nationalities.find((f) => f.value === "Brazilian");
    expect(nigerian?.count).toBe(2);
    expect(brazilian).toBeUndefined();
  });

  it("respects the text filter for both facet dimensions", () => {
    const result = facets({ search: "amara" });
    expect(result.nationalities).toEqual([{ value: "Nigerian", count: 2 }]);
    expect(result.hobbies.map((f) => f.value).sort()).toEqual(["Chess", "Hiking"]);
  });

  it("sorts facets by count descending, then alphabetically", () => {
    const result = facets();
    const counts = result.hobbies.map((f) => f.count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it("caps results at the top 20 per dimension", () => {
    const manyHobbyUsers: FixtureUser[] = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      first_name: `User${i}`,
      last_name: "Test",
      age: 30,
      nationality: "Testland",
      hobbies: [`Hobby${i}`],
    }));
    seedFixture(db, manyHobbyUsers);

    const result = facets();
    expect(result.hobbies).toHaveLength(20);
  });
});
