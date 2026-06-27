import { Measurement } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";

class WoodVariantService {
  async getVolume(woodId: number): Promise<number> {
    const woodVariant = await prisma.woodVariant.findUnique({
      where: { id: woodId },
      include: { material: true },
    });
    if (!woodVariant) throw new Error("Wood variant not found");

    if (woodVariant.material.measurement == Measurement.CUBE) {
      if (woodVariant.width == null || woodVariant.height == null || woodVariant.length == null)
        throw new Error("Wood variant is missing dimensions required for CUBE measurement");

      return (woodVariant.width * woodVariant.height * woodVariant.length) / 1000000;
    }

    if (woodVariant.material.measurement == Measurement.CYLINDER) {
      if (woodVariant.diameterSmall == null || woodVariant.diameterSmall == null || woodVariant.length == null)
        throw new Error("Wood variant is missing dimensions required for CYLINDER measurement");

      const diameter = (woodVariant.diameterSmall + woodVariant.diameterSmall) / 2;
      return (Math.PI * Math.pow(diameter, 2) * woodVariant.length) / 1000000;
    }

    throw new Error("Unknown measurement type");
  }
}

export default new WoodVariantService();
