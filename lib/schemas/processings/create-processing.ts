import z from "zod";

export const createProcessingSchema = z.object({
  processingDate: z.string().min(1, "Processing date is required"),
  locationId: z.coerce.number().int().positive("Location is required"),
  contactId: z.coerce.number().int().positive("Worker/Contact is required"),
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  inputItems: z
    .array(
      z.object({
        inventoryId: z.coerce.number().int().positive(),
        woodVariantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive("Quantity must be positive"),
      }),
    )
    .min(1, "At least one input item must be selected")
    .refine(
      (items) => {
        const ids = items.map((i) => i.woodVariantId);
        return ids.length === new Set(ids).size;
      },
      { message: "Duplicate wood variants are not allowed in inputs" },
    ),
  outputItems: z
    .array(
      z.object({
        woodVariantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive("Quantity must be positive"),
      }),
    )
    .min(1, "At least one output item must be added")
    .refine(
      (items) => {
        const ids = items.map((i) => i.woodVariantId);
        return ids.length === new Set(ids).size;
      },
      { message: "Duplicate wood variants are not allowed in outputs" },
    ),
});

export type CreateProcessingSchema = z.infer<typeof createProcessingSchema>;
