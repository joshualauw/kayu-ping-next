import z from "zod";

export const updateMovementSchema = z.object({
  notes: z.string().nullish(),
});

export type UpdateMovementSchema = z.infer<typeof updateMovementSchema>;

export const updateMovementFormSchema = z.object({
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
});

export type UpdateMovementFormInput = z.input<typeof updateMovementFormSchema>;
export type UpdateMovementFormOutput = z.output<typeof updateMovementFormSchema>;
