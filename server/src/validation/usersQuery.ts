import { z } from "zod";

const csv = z.preprocess(
  (value) => (typeof value === "string" && value.length > 0 ? value.split(",") : []),
  z.array(z.string()),
);

export const usersQuerySchema = z.object({
  q: z.string().trim().optional(),
  nationalities: csv,
  hobbies: csv,
  sortBy: z.enum(["first_name", "last_name", "age", "nationality"]).default("first_name"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
});

export const facetsQuerySchema = z.object({
  q: z.string().trim().optional(),
  nationalities: csv,
  hobbies: csv,
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;
export type FacetsQuery = z.infer<typeof facetsQuerySchema>;
