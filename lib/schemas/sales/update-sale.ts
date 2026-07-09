import z from "zod";

export const updateSaleSchema = z.object({
  notes: z.string().nullish(),
});

export type UpdateSaleSchema = z.infer<typeof updateSaleSchema>;

export const updateSaleFormSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
});

export type UpdateSaleFormInput = z.input<typeof updateSaleFormSchema>;
export type UpdateSaleFormOutput = z.output<typeof updateSaleFormSchema>;
