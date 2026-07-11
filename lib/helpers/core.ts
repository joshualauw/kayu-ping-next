import { ReferenceType } from "@/generated/prisma/enums";
import { Measurement } from "@/generated/prisma/enums";

interface WoodVolumeCalculationParams {
  width?: number;
  height?: number;
  length?: number;
  diameterSmall?: number;
  diameterLarge?: number;
  measurement: Measurement;
}

interface WoodVariantLabelParams {
  woodCode: string;
  materialCode: string;
  width: number | null;
  height: number | null;
  diameterSmall: number | null;
  diameterLarge: number | null;
  length: number | null;
  measurement: Measurement;
}

export function getReferenceLink(type: ReferenceType, id: number | null): string | null {
  if (!id) return null;
  if (type === ReferenceType.PURCHASE) {
    return `/admin/purchases/${id}`;
  } else if (type === ReferenceType.SALES) {
    return `/admin/sales/${id}`;
  } else if (type === ReferenceType.PROCESSING) {
    return `/admin/processings/${id}`;
  } else if (type === ReferenceType.MOVEMENT) {
    return `/admin/movements/${id}`;
  } else if (type === ReferenceType.GRADING) {
    return `/admin/gradings/${id}`;
  } else if (type === ReferenceType.ADJUSTMENT) {
    return `/admin/adjustments/${id}`;
  }
  return null;
}

export function generateWoodVariantLabel(params: WoodVariantLabelParams) {
  const { woodCode, materialCode, width, height, diameterSmall, diameterLarge, length, measurement } = params;

  if (measurement === Measurement.CUBE) {
    return `${woodCode} - ${materialCode} (${width}/${height}x${length}cm)`;
  }
  if (measurement === Measurement.CYLINDER) {
    return `${woodCode} - ${materialCode} (D${diameterSmall}/D${diameterLarge}x${length}cm)`;
  }
  return "-";
}

export function calculateWoodVolume(params: WoodVolumeCalculationParams): number {
  const { width, height, length, diameterSmall, diameterLarge, measurement } = params;

  if (measurement == Measurement.CUBE) {
    if (width == null || height == null || length == null)
      throw new Error("Wood variant is missing dimensions required for CUBE measurement");

    return (width * height * length) / 1000000;
  }

  if (measurement == Measurement.CYLINDER) {
    if (diameterSmall == null || diameterLarge == null || length == null)
      throw new Error("Wood variant is missing dimensions required for CYLINDER measurement");

    const diameter = (diameterSmall + diameterLarge) / 2;
    return (Math.PI * Math.pow(diameter, 2) * length) / 1000000;
  }

  throw new Error("Unknown measurement type");
}
