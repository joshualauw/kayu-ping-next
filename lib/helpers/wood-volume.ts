import { Measurement } from "@/generated/prisma/enums";

interface WoodVolumeCalculationParams {
  width?: number;
  height?: number;
  length?: number;
  diameterSmall?: number;
  diameterLarge?: number;
  measurement: Measurement;
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

export function calculateWoodTotalVolume(woodVolume: number, quantity: number) {
  return woodVolume * quantity;
}

export function calculateSubtotal(woodVolume: number, pricePerM3: number, quantity: number) {
  return calculateWoodTotalVolume(woodVolume, quantity) * pricePerM3;
}
