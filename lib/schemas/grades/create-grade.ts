import z from "zod";

export const createGradeSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export type CreateGradeSchema = z.infer<typeof createGradeSchema>;

export const createGradeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
});

export type CreateGradeFormInput = z.input<typeof createGradeFormSchema>;
export type CreateGradeFormOutput = z.output<typeof createGradeFormSchema>;
