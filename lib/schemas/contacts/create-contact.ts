import z from "zod";
import { ContactType } from "@/generated/prisma/enums";

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format")
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  email: z
    .email("Invalid email format")
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  address: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  type: z.enum(ContactType, "Contact type is required"),
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
});

export type CreateContactSchema = z.infer<typeof createContactSchema>;
