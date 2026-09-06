import { createApp } from "./app";
import { getDb } from "./db/client";

// Optional: loads server/.env if present (see .env.example). Silently continues without it —
// PORT and DATABASE_PATH both have working defaults.
try {
  process.loadEnvFile();
} catch {
  // no .env file present — fine, defaults apply
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const db = getDb();
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
