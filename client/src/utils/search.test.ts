import { describe, expect, it } from "vitest";
import { MIN_SEARCH_LENGTH, normalizeSearch, sanitizeSearchInput, toSearchQuery } from "./search";

describe("normalizeSearch", () => {
  it("strips leading and trailing whitespace", () => {
    expect(normalizeSearch("  ann  ")).toBe("ann");
  });

  it("collapses internal whitespace runs so spacing variants share one cache key", () => {
    expect(normalizeSearch("john  smith")).toBe("john smith");
    expect(normalizeSearch(" john   smith ")).toBe("john smith");
    expect(normalizeSearch("john\tsmith")).toBe("john smith");
  });

  it("reduces a whitespace-only string to empty", () => {
    expect(normalizeSearch("   ")).toBe("");
    expect(normalizeSearch("\t\n ")).toBe("");
  });

  it("leaves an already-normal value untouched and is idempotent", () => {
    expect(normalizeSearch("name fa")).toBe("name fa");
    expect(normalizeSearch(normalizeSearch(" a  b "))).toBe("a b");
  });
});

describe("toSearchQuery", () => {
  it("drops searches shorter than the minimum length", () => {
    expect(toSearchQuery("a")).toBe("");
    expect(toSearchQuery(" a ")).toBe("");
  });

  it("keeps searches at or above the minimum length", () => {
    expect(toSearchQuery("an")).toBe("an");
    expect(toSearchQuery("  ann  ")).toBe("ann");
  });

  it("treats whitespace-only input as no search", () => {
    expect(toSearchQuery("   ")).toBe("");
  });

  it("agrees with the documented minimum", () => {
    expect(toSearchQuery("x".repeat(MIN_SEARCH_LENGTH))).toHaveLength(MIN_SEARCH_LENGTH);
    expect(toSearchQuery("x".repeat(MIN_SEARCH_LENGTH - 1))).toBe("");
  });
});

describe("sanitizeSearchInput", () => {
  it("drops digits and symbols that cannot appear in a name", () => {
    expect(sanitizeSearchInput("ann123")).toBe("ann");
    expect(sanitizeSearchInput("a@n#n!")).toBe("ann");
    expect(sanitizeSearchInput("<script>")).toBe("script");
  });

  it("keeps the hyphen and apostrophe real surnames use", () => {
    expect(sanitizeSearchInput("Windler-Fritsch")).toBe("Windler-Fritsch");
    expect(sanitizeSearchInput("O'Brien")).toBe("O'Brien");
  });

  it("keeps spaces and accented letters", () => {
    expect(sanitizeSearchInput("name fa")).toBe("name fa");
    expect(sanitizeSearchInput("José Müller")).toBe("José Müller");
  });

  it("leaves a clean value untouched and is idempotent", () => {
    expect(sanitizeSearchInput("ann")).toBe("ann");
    expect(sanitizeSearchInput(sanitizeSearchInput("a1b2"))).toBe("ab");
  });
});
