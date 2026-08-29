import { createApp } from "./app";
import { getDb } from "./db/client";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const db = getDb();
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
