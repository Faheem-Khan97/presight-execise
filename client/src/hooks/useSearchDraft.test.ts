import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSearchDraft } from "./useSearchDraft";

const DELAY = 300;

/** Drives the hook the way App does: `commit` stands in for the URL write. */
function renderDraft(initial = "") {
  const commits: string[] = [];
  let committed = initial;

  const view = renderHook(
    ({ value }: { value: string }) =>
      useSearchDraft(
        value,
        (next) => {
          commits.push(next);
          committed = next;
        },
        DELAY,
      ),
    { initialProps: { value: initial } },
  );

  /** Types `text`, then lets the debounce settle and replays the resulting URL back in. */
  function type(text: string) {
    act(() => view.result.current.setDraft(text));
    act(() => void vi.advanceTimersByTime(DELAY));
    view.rerender({ value: committed });
  }

  return { ...view, type, commits, getCommitted: () => committed };
}

describe("useSearchDraft", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("never commits a whitespace-only search", () => {
    const { type, commits, getCommitted } = renderDraft();

    type(" ");
    type("   ");
    type("\t");

    expect(commits).toEqual([]);
    expect(getCommitted()).toBe("");
  });

  it("keeps whitespace visible in the box while the user types it", () => {
    const { result, type } = renderDraft();

    type(" ");
    expect(result.current.draft).toBe(" ");
  });

  it("lets the user type a multi-word search without losing the space", () => {
    const { result, type, getCommitted } = renderDraft();

    for (const keystroke of ["n", "na", "nam", "name", "name ", "name f", "name fa"]) {
      type(keystroke);
    }

    expect(result.current.draft).toBe("name fa");
    expect(result.current.search).toBe("name fa");
    expect(getCommitted()).toBe("name fa");
  });

  it("commits a trailing space as the trimmed value, so the URL stays clean", () => {
    const { type, getCommitted } = renderDraft();

    type("ann ");

    expect(getCommitted()).toBe("ann");
  });

  it("does not re-commit when a change only adds whitespace", () => {
    const { type, commits } = renderDraft();

    type("ann");
    type("ann ");
    type("ann  ");

    expect(commits).toEqual(["ann"]);
  });

  it("collapses internal whitespace into a single committed value", () => {
    const { type, commits } = renderDraft();

    type("john smith");
    type("john  smith");

    expect(commits).toEqual(["john smith"]);
  });

  it("cleans a dirty value arriving from a shared link", () => {
    const { commits } = renderDraft("  ann  ");

    act(() => void vi.advanceTimersByTime(DELAY));

    expect(commits).toEqual(["ann"]);
  });

  it("refuses non-name characters as they are typed", () => {
    const { result, type, commits } = renderDraft();

    type("1");
    expect(result.current.draft).toBe("");

    type("ann123");
    expect(result.current.draft).toBe("ann");
    expect(commits).toEqual(["ann"]);
  });

  it("still accepts hyphenated and apostrophe surnames", () => {
    const { result, type, getCommitted } = renderDraft();

    type("Windler-Fritsch");
    expect(result.current.draft).toBe("Windler-Fritsch");
    expect(getCommitted()).toBe("Windler-Fritsch");

    type("O'Brien");
    expect(result.current.draft).toBe("O'Brien");
  });

  it("strips non-name characters arriving from a crafted link", () => {
    const { result, commits } = renderDraft("ann123");

    act(() => void vi.advanceTimersByTime(DELAY));

    expect(result.current.draft).toBe("ann");
    expect(commits).toEqual(["ann"]);
  });

  it("adopts an external URL change, such as the back button", () => {
    const { result, rerender, type } = renderDraft();

    type("ann");
    rerender({ value: "" });

    expect(result.current.draft).toBe("");
  });
});
