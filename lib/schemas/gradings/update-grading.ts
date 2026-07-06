import z from "zod";

export const updateGradingSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
});

export type UpdateGradingSchema = z.infer<typeof updateGradingSchema>;
