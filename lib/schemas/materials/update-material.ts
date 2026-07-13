import z from "zod";
import { Measurement } from "@/generated/prisma/enums";

export const updateMaterialSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export type UpdateMaterialSchema = z.infer<typeof updateMaterialSchema>;

export const updateMaterialFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  measurement: z.enum(Measurement).optional(),
});

export type UpdateMaterialFormInput = z.input<typeof updateMaterialFormSchema>;
export type UpdateMaterialFormOutput = z.output<typeof updateMaterialFormSchema>;
