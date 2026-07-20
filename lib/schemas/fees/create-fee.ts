import z from "zod";
import { ReferenceType } from "@/generated/prisma/enums";

export const createFeeSchema = z.object({
  name: z.string().trim().min(1),
  price: z.number().positive(),
  referenceId: z.number().int().positive(),
  referenceType: z.enum(ReferenceType),
});

export type CreateFeeSchema = z.infer<typeof createFeeSchema>;

export const createFeeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ message: "Price is required" }).positive("Price must be positive"),
  ),
});

export type CreateFeeFormInput = z.input<typeof createFeeFormSchema>;
export type CreateFeeFormOutput = z.output<typeof createFeeFormSchema>;
