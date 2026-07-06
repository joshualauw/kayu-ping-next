import z from "zod";
import { positiveIntegerString, positiveNumericString } from "@/lib/schemas/reusable-schema";

export const createPurchaseSchema = z.object({
  purchaseDate: z.string().min(1),
  locationId: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  notes: z.string().nullish(),
  items: z
    .array(
      z.object({
        woodId: z.number().int().positive(),
        materialId: z.number().int().positive(),
        measurement: z.enum(["CUBE", "CYLINDER"]),
        width: z.number().positive().nullish(),
        height: z.number().positive().nullish(),
        diameterSmall: z.number().positive().nullish(),
        diameterLarge: z.number().positive().nullish(),
        length: z.number().positive(),
        quantity: z.number().int().positive(),
        pricePerCubic: z.number().positive(),
      }),
    )
    .min(1),
});

export type CreatePurchaseSchema = z.infer<typeof createPurchaseSchema>;

export const createPurchaseFormSchema = z.object({
  purchaseDate: z.string().min(1, "Purchase date is required"),
  locationId: z.string().min(1, "Location is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        woodId: z.string().min(1, "Wood is required"),
        materialId: z.string().min(1, "Material is required"),
        measurement: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        diameterSmall: z.string().optional(),
        diameterLarge: z.string().optional(),
        length: positiveNumericString("Length"),
        quantity: positiveIntegerString("Quantity"),
        pricePerCubic: positiveNumericString("Price"),
      }),
    )
    .min(1, "At least one item must be added to the cart")
    .superRefine((items, ctx) => {
      items.forEach((item, index) => {
        const validateRequiredPositive = (val: string | undefined, fieldName: string, path: string) => {
          if (!val || val.trim() === "") {
            ctx.addIssue({
              code: "custom",
              message: `${fieldName} is required`,
              path: [index, path],
            });
            return;
          }
          const num = Number(val);
          if (isNaN(num) || num <= 0) {
            ctx.addIssue({
              code: "custom",
              message: `${fieldName} must be positive`,
              path: [index, path],
            });
          }
        };

        if (item.measurement === "CUBE") {
          validateRequiredPositive(item.width, "Width", "width");
          validateRequiredPositive(item.height, "Height", "height");
        } else if (item.measurement === "CYLINDER") {
          validateRequiredPositive(item.diameterSmall, "Diameter Small", "diameterSmall");
          validateRequiredPositive(item.diameterLarge, "Diameter Large", "diameterLarge");
        }
      });
    }),
});

export type CreatePurchaseFormInput = z.input<typeof createPurchaseFormSchema>;
export type CreatePurchaseFormOutput = z.output<typeof createPurchaseFormSchema>;
