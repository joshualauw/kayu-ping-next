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

export const createProcessingSchema = z.object({
  processingDate: z.string().min(1, "Processing date is required"),
  locationId: z.coerce.number().int().positive("Location is required"),
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
        quantity: requiredPositiveNumber("Quantity", true),
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
        woodId: z.coerce.number().int().positive("Wood is required"),
        materialId: z.coerce.number().int().positive("Material is required"),
        measurement: z.enum(["CUBE", "CYLINDER"], "Measurement type is required"),
        width: optionalPositiveNumber("Width"),
        height: optionalPositiveNumber("Height"),
        diameterSmall: optionalPositiveNumber("Diameter Small"),
        diameterLarge: optionalPositiveNumber("Diameter Large"),
        length: requiredPositiveNumber("Length"),
        quantity: requiredPositiveNumber("Quantity", true),
      }),
    )
    .min(1, "At least one output item must be added")
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

export type CreateProcessingSchema = z.infer<typeof createProcessingSchema>;
