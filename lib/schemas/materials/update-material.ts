import z from "zod";

export const updateMaterialSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type UpdateMaterialSchema = z.infer<typeof updateMaterialSchema>;
