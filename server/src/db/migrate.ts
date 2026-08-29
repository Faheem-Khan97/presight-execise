import { readFileSync } from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import { getDb } from "./client";

export function migrate(db: Database.Database = getDb()): void {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

if (require.main === module) {
  migrate();
  console.log("Migration complete.");
}
