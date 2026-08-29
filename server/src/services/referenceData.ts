import type Database from "better-sqlite3";

interface ReferenceCache {
  nationalityIdByName: Map<string, number>;
  hobbyIdByName: Map<string, number>;
}

let cache: ReferenceCache | null = null;

/**
 * Nationalities and hobbies are small, effectively-static lookup tables (~40 rows each), so
 * they're cached in memory on first use rather than joined on every request just to translate
 * the client's name-based filter values into the ids the query layer needs.
 */
export function loadReferenceData(db: Database.Database): ReferenceCache {
  if (cache) return cache;

  const nationalities = db.prepare("SELECT id, name FROM nationalities").all() as { id: number; name: string }[];
  const hobbies = db.prepare("SELECT id, name FROM hobbies").all() as { id: number; name: string }[];

  cache = {
    nationalityIdByName: new Map(nationalities.map((row) => [row.name, row.id])),
    hobbyIdByName: new Map(hobbies.map((row) => [row.name, row.id])),
  };
  return cache;
}

/**
 * Unknown names map to -1 (never a real row id) rather than being dropped. Dropping them would
 * shrink the array back to length 0, which the query layer reads as "no filter requested" — an
 * unknown name must still filter to zero matches, not silently disable the filter.
 */
export function resolveNames(names: string[], idByName: Map<string, number>): number[] {
  return names.map((name) => idByName.get(name) ?? -1);
}

/** Test-only: clears the cache so each test can seed a fresh in-memory database. */
export function resetReferenceDataCache(): void {
  cache = null;
}
