/**
 * Characters a name can legitimately contain: any Unicode letter (so accented names keep
 * working), plus the hyphen and apostrophe the seed data already uses (Windler-Fritsch,
 * O'Brien) and the space. Anything else can never match a name, so it is dropped before it
 * reaches the input.
 */
const DISALLOWED_SEARCH_CHARS = /[^\p{L}\p{M}\s'-]/gu;

/** Strips characters that cannot appear in a name, for both typing and paste. */
export function sanitizeSearchInput(value: string): string {
  return value.replace(DISALLOWED_SEARCH_CHARS, "");
}

/** Searches shorter than this are treated as no search at all. Set to 1 to disable the gate. */
export const MIN_SEARCH_LENGTH = 2;

/**
 * Collapses whitespace so that cosmetically different inputs resolve to one value — and so to
 * one React Query key and one request. "  john   smith " and "john smith" both become
 * "john smith"; a whitespace-only string becomes "".
 */
export function normalizeSearch(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * The value actually sent to the API. "" means "omit the q param entirely", which is what both
 * a blank box and a too-short search collapse to.
 */
export function toSearchQuery(value: string): string {
  const normalized = normalizeSearch(value);
  return normalized.length >= MIN_SEARCH_LENGTH ? normalized : "";
}
