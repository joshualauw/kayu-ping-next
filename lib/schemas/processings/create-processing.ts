import z from "zod";
import { Measurement } from "@/generated/prisma/enums";
import { formSelectIdSchema } from "@/lib/schemas/reusable-schema";
import type { LocationInventoryItem } from "@/app/api/inventories/by-location/route";

export const createProcessingSchema = z.object({
  processingDate: z.string().min(1),
  locationId: z.number().int().positive(),
  notes: z.string().nullish(),
  inputItems: z
    .array(
      z.object({
        inventoryId: z.number().int().positive(),
        woodVariantId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  outputItems: z
    .array(
      z.object({
        woodId: z.number().int().positive(),
        materialId: z.number().int().positive(),
        measurement: z.enum(["CUBE", "CYLINDER"]),
        width: z.number().positive().nullable().optional(),
        height: z.number().positive().nullable().optional(),
        diameterSmall: z.number().positive().nullable().optional(),
        diameterLarge: z.number().positive().nullable().optional(),
        length: z.number().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type CreateProcessingSchema = z.infer<typeof createProcessingSchema>;

export const getCreateProcessingFormSchema = (materials: { id: number; measurement: Measurement }[]) =>
  z.object({
    processingDate: z.string().min(1, "Processing date is required"),
    locationId: formSelectIdSchema("Location is required"),
    notes: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .optional(),
    groups: z
      .array(
        z.object({
          input: z.object({
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
          }),
          outputs: z
            .array(
              z.object({
                materialId: formSelectIdSchema("Material is required"),
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
                length: z
                  .union([z.string(), z.number()])
                  .transform((val) => {
                    if (val === "" || val === null || val === undefined) return undefined;
                    return Number(val);
                  })
                  .pipe(z.number({ message: "Length is required" }).positive("Length must be positive")),
                quantity: z
                  .union([z.string(), z.number()])
                  .transform((val) => {
                    if (val === "" || val === null || val === undefined) return undefined;
                    return Number(val);
                  })
                  .pipe(z.number({ message: "Quantity is required" }).int().positive("Quantity must be positive")),
              }),
            )
            .min(1, "At least one output item must be added")
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
      .min(1, "At least one group is required")
      .refine(
        (groups) => {
          const ids = groups.map((g) => g.input?.woodVariantId).filter(Boolean);
          return ids.length === new Set(ids).size;
        },
        { message: "Duplicate input wood variants are not allowed" },
      ),
  });

export type CreateProcessingFormSchema = ReturnType<typeof getCreateProcessingFormSchema>;
export type CreateProcessingFormInput = z.input<CreateProcessingFormSchema>;
export type CreateProcessingFormOutput = z.output<CreateProcessingFormSchema>;
