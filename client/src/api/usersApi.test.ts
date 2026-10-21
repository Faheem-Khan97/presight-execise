import { describe, expect, it } from "vitest";
import { buildQueryString } from "./usersApi";

describe("buildQueryString", () => {
  it("omits an empty string param", () => {
    expect(buildQueryString({ q: "", page: 1 })).toBe("page=1");
  });

  it("omits a whitespace-only param instead of sending q=+++", () => {
    expect(buildQueryString({ q: "   ", page: 1 })).toBe("page=1");
    expect(buildQueryString({ q: "\t", page: 1 })).toBe("page=1");
  });

  it("omits undefined and empty arrays", () => {
    expect(buildQueryString({ q: undefined, hobbies: [], page: 1 })).toBe("page=1");
  });

  it("sends real values, including ones with internal spaces", () => {
    expect(buildQueryString({ q: "name fa" })).toBe("q=name+fa");
    expect(buildQueryString({ hobbies: ["Chess", "Hiking"] })).toBe("hobbies=Chess%2CHiking");
  });
});
