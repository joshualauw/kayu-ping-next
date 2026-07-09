import z from "zod";
import { formSelectIdSchema } from "@/lib/schemas/reusable-schema";
import type { LocationInventoryItem } from "@/app/api/inventories/by-location/route";

export const createSaleSchema = z.object({
  saleDate: z.string().min(1),
  locationId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  notes: z.string().nullish(),
  items: z
    .array(
      z.object({
        inventoryId: z.number().int().positive(),
        woodVariantId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        pricePerCubic: z.number().positive(),
      }),
    )
    .min(1),
});

export type CreateSaleSchema = z.infer<typeof createSaleSchema>;

export const createSaleFormSchema = z.object({
  saleDate: z.string().min(1, "Sale date is required"),
  locationId: formSelectIdSchema("Location is required"),
  customerId: formSelectIdSchema("Customer is required"),
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
        pricePerCubic: z
          .union([z.string(), z.number()])
          .transform((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return Number(val);
          })
          .pipe(z.number({ message: "Price is required" }).positive("Price must be positive")),
        originalStock: z.number().optional(),
        variant: z.custom<LocationInventoryItem["variant"]>().optional(),
        grade: z.custom<LocationInventoryItem["grade"]>().optional(),
      }),
    )
    .min(1, "At least one item must be added to the cart"),
});

export type CreateSaleFormInput = z.input<typeof createSaleFormSchema>;
export type CreateSaleFormOutput = z.output<typeof createSaleFormSchema>;
