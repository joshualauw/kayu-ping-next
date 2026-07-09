import z from "zod";

export const updateProcessingSchema = z.object({
  notes: z.string().nullish(),
});

export type UpdateProcessingSchema = z.infer<typeof updateProcessingSchema>;

export const updateProcessingFormSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
});

export type UpdateProcessingFormInput = z.input<typeof updateProcessingFormSchema>;
export type UpdateProcessingFormOutput = z.output<typeof updateProcessingFormSchema>;
