import z from "zod";

export const updateSaleSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
});

export type UpdateSaleSchema = z.infer<typeof updateSaleSchema>;
