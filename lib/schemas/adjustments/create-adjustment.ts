import z from "zod";
import { formSelectIdSchema } from "@/lib/schemas/reusable-schema";
import type { LocationInventoryItem } from "@/app/api/inventories/by-location/route";

export const createAdjustmentSchema = z.object({
  adjustmentDate: z.string().min(1),
  locationId: z.number().int().positive(),
  notes: z.string().nullish(),
  items: z
    .array(
      z.object({
        inventoryId: z.number().int().positive(),
        woodVariantId: z.number().int().positive(),
        gradeId: z.number().int().positive().nullable(),
        quantity: z.number().int().positive(),
        type: z.enum(["ADD", "SUBTRACT"]),
        reason: z.enum(["LOST", "FOUND", "DAMAGE", "OTHERS"]),
        comment: z.string().nullish(),
      }),
    )
    .min(1),
});

export type CreateAdjustmentSchema = z.infer<typeof createAdjustmentSchema>;

export const createAdjustmentFormSchema = z.object({
  adjustmentDate: z.string().min(1, "Adjustment date is required"),
  locationId: formSelectIdSchema("Location is required"),
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
  items: z
    .array(
      z.object({
        inventoryId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
        woodVariantId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
        gradeId: z
          .union([z.string(), z.number()])
          .nullable()
          .optional()
          .transform((val) => (val === "ungraded" || val === "" || val === null || val === undefined ? null : Number(val))),
        quantity: z
          .union([z.string(), z.number()])
          .transform((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return Number(val);
          })
          .pipe(z.number({ message: "Quantity is required" }).int().positive("Quantity must be positive")),
        type: z.enum(["ADD", "SUBTRACT"], { message: "Type is required" }),
        reason: z.enum(["LOST", "FOUND", "DAMAGE", "OTHERS"], { message: "Reason is required" }),
        comment: z
          .string()
          .trim()
          .transform((val) => (val === "" ? null : val))
          .optional()
          .nullable(),
        originalStock: z.number().optional(),
        variant: z.custom<LocationInventoryItem["variant"]>().optional(),
        grade: z.custom<LocationInventoryItem["grade"]>().optional(),
        lot: z.custom<LocationInventoryItem["lot"]>().optional(),
      }),
    )
    .min(1, "At least one item must be added to the cart"),
});

export type CreateAdjustmentFormInput = z.input<typeof createAdjustmentFormSchema>;
export type CreateAdjustmentFormOutput = z.output<typeof createAdjustmentFormSchema>;
