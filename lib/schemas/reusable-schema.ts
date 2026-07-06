import z from "zod";

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

export const positiveNumericString = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, `${fieldName} must be positive`);

export const positiveIntegerString = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && Number.isInteger(num) && num > 0;
    }, `${fieldName} must be a positive integer`);
