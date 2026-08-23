import { describe, expect, it } from "vitest";
import type { User } from "../types/user";
import { computeFacets, filterUsers, paginateUsers, sortUsers } from "./queryEngine";

const users: User[] = [
  { id: 1, avatar: "", first_name: "Amara", last_name: "Okafor", age: 29, nationality: "Nigerian", hobbies: ["Chess", "Hiking"] },
  { id: 2, avatar: "", first_name: "Lucas", last_name: "Silva", age: 34, nationality: "Brazilian", hobbies: ["Surfing", "Cooking"] },
  { id: 3, avatar: "", first_name: "Amara", last_name: "Diallo", age: 29, nationality: "Nigerian", hobbies: ["Chess"] },
  { id: 4, avatar: "", first_name: "Chidi", last_name: "Okafor", age: 41, nationality: "Nigerian", hobbies: ["Hiking", "Cooking"] },
  { id: 5, avatar: "", first_name: "Elif", last_name: "Yildiz", age: 22, nationality: "Turkish", hobbies: [] },
];

describe("filterUsers", () => {
  it("matches search text against first or last name, case-insensitively", () => {
    const result = filterUsers(users, { search: "okafor" });
    expect(result.map((u) => u.id)).toEqual([1, 4]);
  });

  it("matches nationalities with OR semantics", () => {
    const result = filterUsers(users, { nationalities: ["Brazilian", "Turkish"] });
    expect(result.map((u) => u.id)).toEqual([2, 5]);
  });

  it("matches hobbies with AND semantics (must have all selected hobbies)", () => {
    const result = filterUsers(users, { hobbies: ["Hiking", "Cooking"] });
    expect(result.map((u) => u.id)).toEqual([4]);
  });

  it("combines search, hobbies, and nationality filters with AND", () => {
    const result = filterUsers(users, {
      search: "amara",
      nationalities: ["Nigerian"],
      hobbies: ["Chess"],
    });
    expect(result.map((u) => u.id)).toEqual([1, 3]);
  });

  it("returns everyone when no filters are applied", () => {
    expect(filterUsers(users, {})).toHaveLength(users.length);
  });
});

describe("sortUsers", () => {
  it("sorts by the given field ascending", () => {
    const result = sortUsers(users, "age", "asc");
    expect(result.map((u) => u.age)).toEqual([22, 29, 29, 34, 41]);
  });

  it("sorts by the given field descending", () => {
    const result = sortUsers(users, "last_name", "desc");
    expect(result.map((u) => u.last_name)).toEqual(["Yildiz", "Silva", "Okafor", "Okafor", "Diallo"]);
  });

  it("uses id as a deterministic tie-breaker when sort values are equal", () => {
    const result = sortUsers(users, "age", "asc");
    const tiedAgeUsers = result.filter((u) => u.age === 29);
    expect(tiedAgeUsers.map((u) => u.id)).toEqual([1, 3]);
  });

  it("does not mutate the input array", () => {
    const copy = [...users];
    sortUsers(users, "first_name", "asc");
    expect(users).toEqual(copy);
  });
});

describe("paginateUsers", () => {
  it("slices results for the requested page", () => {
    const result = paginateUsers(users, 1, 2);
    expect(result.data.map((u) => u.id)).toEqual([1, 2]);
    expect(result.total).toBe(5);
  });

  it("reports hasMore=true when more pages remain", () => {
    const result = paginateUsers(users, 1, 2);
    expect(result.hasMore).toBe(true);
  });

  it("reports hasMore=false on the last page", () => {
    const result = paginateUsers(users, 3, 2);
    expect(result.data.map((u) => u.id)).toEqual([5]);
    expect(result.hasMore).toBe(false);
  });

  it("returns an empty page past the end without error", () => {
    const result = paginateUsers(users, 10, 2);
    expect(result.data).toEqual([]);
    expect(result.hasMore).toBe(false);
  });
});

describe("computeFacets", () => {
  it("counts hobbies ignoring the active hobby filter but respecting other filters", () => {
    const facets = computeFacets(users, { nationalities: ["Nigerian"], hobbies: ["Chess"] });
    const chess = facets.hobbies.find((f) => f.value === "Chess");
    const hiking = facets.hobbies.find((f) => f.value === "Hiking");
    expect(chess?.count).toBe(2);
    expect(hiking?.count).toBe(2);
  });

  it("counts nationalities ignoring the active nationality filter but respecting other filters", () => {
    const facets = computeFacets(users, { nationalities: ["Nigerian"], hobbies: ["Chess"] });
    const nigerian = facets.nationalities.find((f) => f.value === "Nigerian");
    const brazilian = facets.nationalities.find((f) => f.value === "Brazilian");
    expect(nigerian?.count).toBe(2);
    expect(brazilian).toBeUndefined();
  });

  it("respects the text filter for both facet dimensions", () => {
    const facets = computeFacets(users, { search: "amara" });
    expect(facets.nationalities).toEqual([{ value: "Nigerian", count: 2 }]);
    expect(facets.hobbies.map((f) => f.value).sort()).toEqual(["Chess", "Hiking"]);
  });

  it("sorts facets by count descending, then alphabetically", () => {
    const facets = computeFacets(users, {});
    const counts = facets.hobbies.map((f) => f.count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it("caps results at the top 20 per dimension", () => {
    const manyHobbyUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      avatar: "",
      first_name: `User${i}`,
      last_name: "Test",
      age: 30,
      nationality: "Testland",
      hobbies: [`Hobby${i}`],
    }));
    const facets = computeFacets(manyHobbyUsers, {});
    expect(facets.hobbies).toHaveLength(20);
  });
});
