import z from "zod";
import type { LocationInventoryItem } from "@/app/api/inventories/by-location/route";
import { formSelectIdSchema } from "@/lib/schemas/reusable-schema";

export const createMovementSchema = z
  .object({
    movementDate: z.string().min(1),
    fromLocationId: z.number().int().positive(),
    toLocationId: z.number().int().positive(),
    truckerId: z.number().int().positive(),
    notes: z.string().nullish(),
    items: z
      .array(
        z.object({
          inventoryId: z.number().int().positive(),
          woodVariantId: z.number().int().positive(),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "To location must be different from from location",
    path: ["toLocationId"],
  });

export type CreateMovementSchema = z.infer<typeof createMovementSchema>;

export const createMovementFormSchema = z
  .object({
    movementDate: z.string().min(1, "Movement date is required"),
    fromLocationId: formSelectIdSchema("From location is required"),
    toLocationId: formSelectIdSchema("To location is required"),
    truckerId: formSelectIdSchema("Trucker is required"),
    notes: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .optional(),
    items: z
      .array(
        z.object({
          inventoryId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
          woodVariantId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
          quantity: z
            .union([z.string(), z.number()])
            .transform((val) => {
              if (val === "" || val === null || val === undefined) return undefined;
              return Number(val);
            })
            .pipe(z.number({ message: "Quantity is required" }).int().positive("Quantity must be positive")),
          originalStock: z.number().optional(),
          variant: z.custom<LocationInventoryItem["variant"]>().optional(),
          grade: z.custom<LocationInventoryItem["grade"]>().optional(),
          lot: z.custom<LocationInventoryItem["lot"]>().optional(),
        }),
      )
      .min(1, "At least one item must be added to the movement"),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "To location must be different from from location",
    path: ["toLocationId"],
  });

export type CreateMovementFormInput = z.input<typeof createMovementFormSchema>;
export type CreateMovementFormOutput = z.output<typeof createMovementFormSchema>;
