import z from "zod";

export const createSaleSchema = z.object({
  saleDate: z.string().min(1, "Sale date is required"),
  locationId: z.coerce.number().int().positive("Location is required"),
  customerId: z.coerce.number().int().positive("Customer is required"),
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  items: z
    .array(
      z.object({
        inventoryId: z.coerce.number().int().positive(),
        woodVariantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive("Quantity must be positive"),
        pricePerCubic: z.coerce.number().positive("Price must be positive"),
      }),
    )
    .min(1, "At least one item must be added to the cart"),
});

export type CreateSaleSchema = z.infer<typeof createSaleSchema>;
