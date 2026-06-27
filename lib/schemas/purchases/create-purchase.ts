import z from "zod";

const optionalPositiveNumber = (fieldName: string) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z
      .number({ message: `${fieldName} must be a number` })
      .positive(`${fieldName} must be positive`)
      .nullable()
      .optional(),
  );

const requiredPositiveNumber = (fieldName: string, isInt: boolean = false) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    isInt
      ? z.int(`${fieldName} must be an integer`)
      : z.number({ message: `${fieldName} is required` }).positive(`${fieldName} must be positive`),
  );

export const createPurchaseSchema = z.object({
  purchaseDate: z.string().min(1, "Purchase date is required"),
  contactId: z.coerce.number().int().positive("Contact is required"),
  locationId: z.coerce.number().int().positive("Location is required"),
  notes: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  paymentStatus: z.enum(["PAID", "UNPAID"], "Payment status is required"),
  items: z
    .array(
      z.object({
        woodId: z.coerce.number().int().positive("Wood is required"),
        materialId: z.coerce.number().int().positive("Material is required"),
        measurement: z.enum(["CUBE", "CYLINDER"], "Measurement type is required"),
        width: optionalPositiveNumber("Width"),
        height: optionalPositiveNumber("Height"),
        diameterSmall: optionalPositiveNumber("Diameter Small"),
        diameterLarge: optionalPositiveNumber("Diameter Large"),
        length: requiredPositiveNumber("Length"),
        quantity: requiredPositiveNumber("Quantity", true),
        pricePerCubic: requiredPositiveNumber("Price"),
      }),
    )
    .min(1, "At least one item must be added to the cart")
    .superRefine((items, ctx) => {
      items.forEach((item, index) => {
        if (item.measurement === "CUBE") {
          if (item.width === null || item.width === undefined) {
            ctx.addIssue({
              code: "custom",
              message: "Width is required",
              path: [index, "width"],
            });
          }
          if (item.height === null || item.height === undefined) {
            ctx.addIssue({
              code: "custom",
              message: "Height is required",
              path: [index, "height"],
            });
          }
        } else if (item.measurement === "CYLINDER") {
          if (item.diameterSmall === null || item.diameterSmall === undefined) {
            ctx.addIssue({
              code: "custom",
              message: "Diameter Small is required",
              path: [index, "diameterSmall"],
            });
          }
          if (item.diameterLarge === null || item.diameterLarge === undefined) {
            ctx.addIssue({
              code: "custom",
              message: "Diameter Large is required",
              path: [index, "diameterLarge"],
            });
          }
        }
      });
    }),
});

export type CreatePurchaseSchema = z.infer<typeof createPurchaseSchema>;
