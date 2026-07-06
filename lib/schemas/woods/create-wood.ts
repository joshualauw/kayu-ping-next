import z from "zod";

export const createWoodSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export type CreateWoodSchema = z.infer<typeof createWoodSchema>;

export const createWoodFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
});

export type CreateWoodFormInput = z.input<typeof createWoodFormSchema>;
export type CreateWoodFormOutput = z.output<typeof createWoodFormSchema>;
