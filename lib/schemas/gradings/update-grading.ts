import z from "zod";

export const updateGradingSchema = z.object({
  notes: z.string().nullish(),
});

export type UpdateGradingSchema = z.infer<typeof updateGradingSchema>;

export const updateGradingFormSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
});

export type UpdateGradingFormInput = z.input<typeof updateGradingFormSchema>;
export type UpdateGradingFormOutput = z.output<typeof updateGradingFormSchema>;
