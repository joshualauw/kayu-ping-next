import z from "zod";
import { LocationType } from "@/generated/prisma/enums";

export const createLocationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  type: z.enum(LocationType, "Location type is required"),
});

export type CreateLocationSchema = z.infer<typeof createLocationSchema>;
