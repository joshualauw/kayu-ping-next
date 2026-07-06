import z from "zod";
import { Measurement } from "@/generated/prisma/enums";

// Backend Schema - simple, focus on database types
export const createMaterialSchema = z.object({
  name: z.string().trim().min(1),
  measurement: z.enum(Measurement),
});

export type CreateMaterialSchema = z.infer<typeof createMaterialSchema>;

// Frontend Schema - validation, user-friendly errors
export const createMaterialFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  measurement: z.enum(Measurement, { message: "Measurement is required" }),
});

export type CreateMaterialFormInput = z.input<typeof createMaterialFormSchema>;
export type CreateMaterialFormOutput = z.output<typeof createMaterialFormSchema>;
