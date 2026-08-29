import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import type Database from "better-sqlite3";
import { createUsersRouter } from "./routes/users";

export function createApp(db: Database.Database) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", createUsersRouter(db));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid query parameters", details: err.issues });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
