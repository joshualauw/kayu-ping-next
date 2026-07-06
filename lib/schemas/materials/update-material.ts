import z from "zod";
import { Measurement } from "@/generated/prisma/enums";

// Backend Schema - simple, focus on database types
export const updateMaterialSchema = z.object({
  name: z.string().trim().min(1),
});

export type UpdateMaterialSchema = z.infer<typeof updateMaterialSchema>;

// Frontend Schema - validation, user-friendly errors
export const updateMaterialFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  measurement: z.enum(Measurement).optional(),
});

export type UpdateMaterialFormInput = z.input<typeof updateMaterialFormSchema>;
export type UpdateMaterialFormOutput = z.output<typeof updateMaterialFormSchema>;
