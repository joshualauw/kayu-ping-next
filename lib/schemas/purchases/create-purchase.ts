import z from "zod";
import { Measurement } from "@/generated/prisma/enums";

export const createPurchaseSchema = z.object({
  purchaseDate: z.string().min(1),
  locationId: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  notes: z.string().nullish(),
  groups: z
    .array(
      z.object({
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
      }),
    )
    .min(1),
});

export type CreatePurchaseSchema = z.infer<typeof createPurchaseSchema>;

export const getCreatePurchaseFormSchema = (materials: { id: number; measurement: Measurement }[]) =>
  z.object({
    purchaseDate: z.string().min(1, "Purchase date is required"),
    locationId: z.coerce.number().int().positive("Location is required"),
    supplierId: z.coerce.number().int().positive("Supplier is required"),
    notes: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .optional()
      .nullable(),
    groups: z
      .array(
        z.object({
          items: z
            .array(
              z.object({
                woodId: z.coerce.number().int().positive("Wood is required"),
                materialId: z.coerce.number().int().positive("Material is required"),
                measurement: z.enum(["CUBE", "CYLINDER"]).optional(),
                width: z.preprocess(
                  (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
                  z.number().positive("Width must be positive").nullable().optional(),
                ),
                height: z.preprocess(
                  (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
                  z.number().positive("Height must be positive").nullable().optional(),
                ),
                diameterSmall: z.preprocess(
                  (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
                  z.number().positive("Diameter must be positive").nullable().optional(),
                ),
                diameterLarge: z.preprocess(
                  (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
                  z.number().positive("Diameter must be positive").nullable().optional(),
                ),
                length: z.preprocess(
                  (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
                  z.number({ message: "Length is required" }).positive("Length must be positive"),
                ),
                quantity: z.preprocess(
                  (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
                  z.number({ message: "Quantity is required" }).int().positive("Quantity must be positive"),
                ),
                pricePerCubic: z.preprocess(
                  (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
                  z.number({ message: "Price is required" }).positive("Price must be positive"),
                ),
              }),
            )
            .min(1, "At least one item must be added to each batch")
            .superRefine((items, ctx) => {
              items.forEach((item, index) => {
                const material = materials.find((m) => m.id === Number(item.materialId));
                const measurement = material?.measurement;
                if (measurement === "CUBE") {
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
                } else if (measurement === "CYLINDER") {
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
        }),
      )
      .min(1, "At least one batch/group is required"),
  });

export type CreatePurchaseFormSchema = ReturnType<typeof getCreatePurchaseFormSchema>;
export type CreatePurchaseFormInput = z.input<CreatePurchaseFormSchema>;
export type CreatePurchaseFormOutput = z.output<CreatePurchaseFormSchema>;
