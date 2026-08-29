import Database from "better-sqlite3";
import path from "node:path";

const DEFAULT_DB_PATH = path.join(__dirname, "../../data/app.db");

export function createDatabase(filePath: string = process.env.DATABASE_PATH ?? DEFAULT_DB_PATH): Database.Database {
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
