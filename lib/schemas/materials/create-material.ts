import z from "zod";
import { Measurement } from "@/generated/prisma/enums";

export const createMaterialSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  measurement: z.enum(Measurement, "Measurement is required"),
});

export type CreateMaterialSchema = z.infer<typeof createMaterialSchema>;
