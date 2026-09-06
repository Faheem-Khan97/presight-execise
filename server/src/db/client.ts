import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_DB_PATH = path.join(__dirname, "../../data/app.db");

export function createDatabase(filePath: string = process.env.DATABASE_PATH ?? DEFAULT_DB_PATH): Database.Database {
  // better-sqlite3 doesn't create the parent directory itself — needed on a fresh checkout,
  // where server/data/ doesn't exist yet (it's untracked: empty dirs aren't stored in git, and
  // the .db file itself is gitignored).
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

let singleton: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!singleton) {
    singleton = createDatabase();
  }
  return singleton;
}
