import z from "zod";
import { LocationType } from "@/generated/prisma/enums";

export const createLocationSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().nullish(),
  type: z.enum(LocationType),
});

export type CreateLocationSchema = z.infer<typeof createLocationSchema>;

export const createLocationFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  type: z.enum(LocationType, { message: "Location type is required" }),
});

export type CreateLocationFormInput = z.input<typeof createLocationFormSchema>;
export type CreateLocationFormOutput = z.output<typeof createLocationFormSchema>;
