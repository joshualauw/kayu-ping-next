import z from "zod";
import { formSelectIdSchema } from "@/lib/schemas/reusable-schema";
import type { LocationInventoryItem } from "@/app/api/inventories/by-location/route";

export const createGradingSchema = z.object({
  gradingDate: z.string().min(1),
  locationId: z.number().int().positive(),
  notes: z.string().nullish(),
  beforeItems: z
    .array(
      z.object({
        inventoryId: z.number().int().positive(),
        woodVariantId: z.number().int().positive(),
        gradeId: z.number().int().positive().nullable(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  afterItems: z
    .array(
      z.object({
        woodVariantId: z.number().int().positive(),
        gradeId: z.number().int().positive().nullable(),
        quantity: z.number().int().positive(),
        comment: z.string().nullish(),
      }),
    )
    .min(1),
});

export type CreateGradingSchema = z.infer<typeof createGradingSchema>;

export const getCreateGradingFormSchema = () =>
  z.object({
    gradingDate: z.string().min(1, "Grading date is required"),
    locationId: formSelectIdSchema("Location is required"),
    notes: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .optional()
      .nullable(),
    groups: z
      .array(
        z.object({
          input: z.object({
            inventoryId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
            woodVariantId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
            originalStock: z.number().optional(),
            gradeId: z
              .union([z.string(), z.number()])
              .nullable()
              .optional()
              .transform((val) => (val === "ungraded" || val === "" || val === null || val === undefined ? null : Number(val))),
            variant: z.custom<LocationInventoryItem["variant"]>().optional(),
            grade: z.custom<LocationInventoryItem["grade"]>().optional(),
          }),
          outputs: z
            .array(
              z.object({
                gradeId: z
                  .union([z.string(), z.number()])
                  .nullable()
                  .optional()
                  .transform((val) => (val === "ungraded" || val === "" || val === null || val === undefined ? null : Number(val))),
                quantity: z
                  .union([z.string(), z.number()])
                  .transform((val) => (val === "" || val === null || val === undefined ? undefined : Number(val)))
                  .pipe(z.number({ message: "Quantity is required" }).int().positive("Quantity must be positive")),
                comment: z
                  .string()
                  .trim()
                  .transform((val) => (val === "" ? null : val))
                  .optional()
                  .nullable(),
              }),
            )
            .min(1, "At least one graded output must be added"),
        }),
      )
      .min(1, "At least one group is required"),
  });

export type CreateGradingFormSchema = ReturnType<typeof getCreateGradingFormSchema>;
export type CreateGradingFormInput = z.input<CreateGradingFormSchema>;
export type CreateGradingFormOutput = z.output<CreateGradingFormSchema>;
