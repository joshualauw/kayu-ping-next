import z from "zod";
import { ContactType } from "@/generated/prisma/enums";

export const createContactSchema = z.object({
  name: z.string().trim().min(1),
  phoneNumber: z.string().nullish(),
  email: z.string().nullish(),
  address: z.string().nullish(),
  type: z.enum(ContactType),
  notes: z.string().nullish(),
});

export type CreateContactSchema = z.infer<typeof createContactSchema>;

export const createContactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format")
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val))
    .optional(),
  email: z
    .email("Invalid email format")
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val))
    .optional(),
  address: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  type: z.enum(ContactType, { message: "Contact type is required" }),
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional(),
});

export type CreateContactFormInput = z.input<typeof createContactFormSchema>;
export type CreateContactFormOutput = z.output<typeof createContactFormSchema>;
