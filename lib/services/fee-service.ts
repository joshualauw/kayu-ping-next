import { prisma } from "@/lib/db/prisma";
import { Fee } from "@/generated/prisma/client";
import { CreateFeeSchema } from "@/lib/schemas/fees/create-fee";

class FeeService {
  async createFee(data: CreateFeeSchema): Promise<Fee> {
    return prisma.fee.create({
      data,
    });
  }
}

export default new FeeService();
