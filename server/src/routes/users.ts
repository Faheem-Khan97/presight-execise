import { Router } from "express";
import type Database from "better-sqlite3";
import { getFacets, getUsers } from "../services/usersService";
import { facetsQuerySchema, usersQuerySchema } from "../validation/usersQuery";

export function createUsersRouter(db: Database.Database): Router {
  const router = Router();

  router.get("/users", (req, res, next) => {
    try {
      const { q, nationalities, hobbies, sortBy, sortDir, page, pageSize } = usersQuerySchema.parse(req.query);
      const result = getUsers(db, {
        search: q,
        sortField: sortBy,
        sortDirection: sortDir,
        nationalities,
        hobbies,
        page,
        pageSize,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/facets", (req, res, next) => {
    try {
      const { q, nationalities, hobbies } = facetsQuerySchema.parse(req.query);
      const result = getFacets(db, { search: q, nationalities, hobbies });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
