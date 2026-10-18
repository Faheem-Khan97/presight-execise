import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import { normalizeSearch, sanitizeSearchInput } from "../utils/search";

interface SearchDraft {
  /** Raw text the user is typing — what SearchInput renders. */
  draft: string;
  setDraft: (value: string) => void;
  /** Debounced + normalized value, safe to use as a query key. */
  search: string;
}

/**
 * Splits "what the user is typing" from "what the URL stores".
 *
 * The draft lives in local state so every keystroke shows up immediately — including the
 * trailing space in "name fa", which a URL-controlled input would swallow. Only the settled,
 * normalized value is committed to the URL, so links and history never carry stray whitespace
 * and no request is made for a value that means the same thing as the last one.
 */
export function useSearchDraft(
  committed: string,
  commit: (value: string) => void,
  delayMs: number,
): SearchDraft {
  const [draft, setDraftState] = useState(() => sanitizeSearchInput(committed));

  // Sanitizing here covers typing and paste alike, and keeps characters that can never
  // match a name from ever reaching the input, the URL, or a request.
  const setDraft = useCallback((value: string) => {
    setDraftState(sanitizeSearchInput(value));
  }, []);
  const search = normalizeSearch(useDebouncedValue(draft, delayMs));

  // Read through a ref so committing depends only on `search`, not on `commit`'s identity
  // (useUrlFilters rebuilds its setters every render).
  const latest = useRef({ committed, commit });
  useEffect(() => {
    latest.current = { committed, commit };
  });

  // Push the settled value into the URL once typing stops.
  useEffect(() => {
    if (search !== latest.current.committed) latest.current.commit(search);
  }, [search]);

  // Adopt external URL changes (back/forward, a shared link) without interrupting typing:
  // a draft that already normalizes to the committed value is left exactly as typed.
  useEffect(() => {
    const target = normalizeSearch(sanitizeSearchInput(committed));
    setDraftState((current) => (normalizeSearch(current) === target ? current : target));
  }, [committed]);

  return { draft, setDraft, search };
}
