import z from "zod";
import { requiredPositiveNumber } from "@/lib/schemas/reusable-schema";

export const createGradingSchema = z.object({
  gradingDate: z.string().min(1, "Grading date is required"),
  locationId: z.coerce.number().int().positive("Location is required"),
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  beforeItems: z
    .array(
      z.object({
        inventoryId: z.coerce.number().int().positive(),
        woodVariantId: z.coerce.number().int().positive(),
        gradeId: z.preprocess(
          (val) => (val === "" || val === null || val === undefined || val === "ungraded" ? null : Number(val)),
          z.number().int().positive().nullable(),
        ),
        quantity: requiredPositiveNumber("Quantity", true),
      }),
    )
    .min(1, "At least one input item must be selected")
    .refine(
      (items) => {
        const keys = items.map((i) => `${i.inventoryId}`);
        return keys.length === new Set(keys).size;
      },
      { message: "Duplicate input inventory items are not allowed" },
    ),
  afterItems: z
    .array(
      z.object({
        woodVariantId: z.coerce.number().int().positive(),
        gradeId: z.preprocess(
          (val) => (val === "" || val === null || val === undefined || val === "ungraded" ? null : Number(val)),
          z.number().int().positive().nullable(),
        ),
        quantity: requiredPositiveNumber("Quantity", true),
        comment: z
          .string()
          .trim()
          .transform((val) => (val === "" ? null : val))
          .nullish(),
      }),
    )
    .min(1, "At least one graded output must be added")
    .refine(
      (items) => {
        const keys = items.map((i) => `${i.woodVariantId}-${i.gradeId}`);
        return keys.length === new Set(keys).size;
      },
      { message: "Duplicate wood variants with the same grade are not allowed in outputs" },
    ),
});

export type CreateGradingSchema = z.infer<typeof createGradingSchema>;
