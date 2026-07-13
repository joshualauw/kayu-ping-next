import z from "zod";
import { Measurement } from "@/generated/prisma/enums";

export const createMaterialSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  measurement: z.enum(Measurement),
});

export type CreateMaterialSchema = z.infer<typeof createMaterialSchema>;

export const createMaterialFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  measurement: z.enum(Measurement, { message: "Measurement is required" }),
});

export type CreateMaterialFormInput = z.input<typeof createMaterialFormSchema>;
export type CreateMaterialFormOutput = z.output<typeof createMaterialFormSchema>;
