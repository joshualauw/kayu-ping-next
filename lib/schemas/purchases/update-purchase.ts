import z from "zod";

export const updatePurchaseSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
});

export type UpdatePurchaseSchema = z.infer<typeof updatePurchaseSchema>;
