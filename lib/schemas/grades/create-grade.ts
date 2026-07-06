import z from "zod";

export const createGradeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
});

export type CreateGradeSchema = z.infer<typeof createGradeSchema>;
