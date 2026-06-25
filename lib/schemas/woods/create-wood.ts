import z from "zod";

export const createWoodSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
});

export type CreateWoodSchema = z.infer<typeof createWoodSchema>;
