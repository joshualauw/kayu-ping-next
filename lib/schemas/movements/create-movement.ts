import z from "zod";

export const createMovementSchema = z
  .object({
    movementDate: z.string().min(1, "Movement date is required"),
    fromLocationId: z.coerce.number().int().positive("From location is required"),
    toLocationId: z.coerce.number().int().positive("To location is required"),
    truckerId: z.coerce.number().int().positive("Trucker is required"),
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
          quantity: z.preprocess(
            (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
            z.number({ message: "Quantity is required" }).int().positive("Quantity must be positive"),
          ),
        }),
      )
      .min(1, "At least one item must be added to the movement"),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "To location must be different from from location",
    path: ["toLocationId"],
  });

export type CreateMovementSchema = z.infer<typeof createMovementSchema>;
