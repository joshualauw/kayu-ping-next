import z from "zod";

export const numericString = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .refine((val) => !isNaN(Number(val)), `${fieldName} must be a number`)
    .refine((val) => Number(val) > 0, `${fieldName} must be positive`);

export const integerString = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .refine((val) => !isNaN(Number(val)), `${fieldName} must be a number`)
    .refine((val) => Number(val) > 0, `${fieldName} must be positive`)
    .refine((val) => Number.isInteger(Number(val)), `${fieldName} must be an integer`);

export const optionalNumericString = (fieldName: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), `${fieldName} must be a number`)
    .refine((val) => !val || Number(val) > 0, `${fieldName} must be positive`);

export const optionalPositiveNumber = (fieldName: string) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z
      .number({ message: `${fieldName} must be a number` })
      .positive(`${fieldName} must be positive`)
      .nullable()
      .optional(),
  );

export const requiredPositiveNumber = (fieldName: string, isInt: boolean = false) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    isInt
      ? z.int(`${fieldName} must be an integer`)
      : z.number({ message: `${fieldName} is required` }).positive(`${fieldName} must be positive`),
  );
