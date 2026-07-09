import { prisma } from "@/lib/db/prisma";
import { Wood, WoodVariant, Material } from "@/generated/prisma/client";
import { WoodWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";

export type WoodForSelect = Pick<Wood, "id" | "name" | "code">;

class WoodService {
  async getAllWoods(params: TableQuery): Promise<TableResponse<Wood>> {
    const { page, size, search } = params;
    const where: WoodWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }];
    }

    const [count, items] = await Promise.all([
      prisma.wood.count({ where }),
      prisma.wood.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return { items, count };
  }

  async getWoodForSelect(): Promise<WoodForSelect[]> {
    return prisma.wood.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  }

  async getWoodById(id: number): Promise<Wood | null> {
    return prisma.wood.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<Wood | null> {
    return prisma.wood.findUnique({
      where: { code },
    });
  }

  async checkCodeExists(code: string, excludeId?: number): Promise<boolean> {
    if (excludeId !== undefined) {
      const existing = await prisma.wood.findFirst({
        where: {
          code,
          NOT: { id: excludeId },
        },
      });
      return !!existing;
    } else {
      const existing = await prisma.wood.findUnique({
        where: { code },
      });
      return !!existing;
    }
  }

  async createWood(data: { name: string; code: string }): Promise<Wood> {
    const codeExist = await this.checkCodeExists(data.code);
    if (codeExist) throw new Error("wood code already exist");

    return prisma.wood.create({
      data,
    });
  }

  async updateWood(id: number, data: { name: string; code: string }): Promise<Wood> {
    const codeExist = await this.checkCodeExists(data.code, id);
    if (codeExist) throw new Error("wood code already exist");

    return prisma.wood.update({
      where: { id },
      data,
    });
  }

  async deleteWood(id: number): Promise<Wood> {
    return prisma.wood.delete({
      where: { id },
    });
  }
}

export default new WoodService();
