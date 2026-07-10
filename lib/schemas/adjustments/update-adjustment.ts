import z from "zod";

export const updateAdjustmentSchema = z.object({
  notes: z.string().nullish(),
});

export type UpdateAdjustmentSchema = z.infer<typeof updateAdjustmentSchema>;

export const updateAdjustmentFormSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
});

export type UpdateAdjustmentFormInput = z.input<typeof updateAdjustmentFormSchema>;
export type UpdateAdjustmentFormOutput = z.output<typeof updateAdjustmentFormSchema>;
