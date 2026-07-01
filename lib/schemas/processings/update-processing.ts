import z from "zod";

export const updateProcessingSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
});

export type UpdateProcessingSchema = z.infer<typeof updateProcessingSchema>;
