import z from "zod";

export const updatePurchaseSchema = z.object({
  notes: z.string().nullish(),
});

export type UpdatePurchaseSchema = z.infer<typeof updatePurchaseSchema>;

export const updatePurchaseFormSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
});

export type UpdatePurchaseFormInput = z.input<typeof updatePurchaseFormSchema>;
export type UpdatePurchaseFormOutput = z.output<typeof updatePurchaseFormSchema>;
