import z from "zod";

export const tableQuerySchema = z.object({
  page: z.coerce.number().int().default(0),
  size: z.coerce.number().int().positive().default(10),
  search: z.string().trim(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TableQuery = z.infer<typeof tableQuerySchema>;

export interface TableResponse<T> {
  items: T[];
  count: number;
}
