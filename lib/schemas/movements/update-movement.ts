import z from "zod";

export const updateMovementSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
});

export type UpdateMovementSchema = z.infer<typeof updateMovementSchema>;
