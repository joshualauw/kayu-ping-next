import { prisma } from "@/lib/db/prisma";
import { Material } from "@/generated/prisma/client";
import { MaterialWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateMaterialSchema } from "@/lib/schemas/materials/create-material";

export type MaterialListItem = Material;

class MaterialService {
  async getAllMaterials(params: TableQuery): Promise<TableResponse<MaterialListItem>> {
    const { page, size, search } = params;
    const where: MaterialWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    const [count, items] = await Promise.all([
      prisma.material.count({ where }),
      prisma.material.findMany({
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

  async getMaterialById(id: number): Promise<Material | null> {
    return prisma.material.findUnique({
      where: { id },
    });
  }

  async createMaterial(data: CreateMaterialSchema): Promise<Material> {
    return prisma.material.create({
      data: {
        name: data.name,
        measurement: data.measurement,
      },
    });
  }

  async updateMaterial(id: number, data: CreateMaterialSchema): Promise<Material> {
    return prisma.material.update({
      where: { id },
      data: {
        name: data.name,
        measurement: data.measurement,
      },
    });
  }

  async deleteMaterial(id: number): Promise<Material> {
    return prisma.material.delete({
      where: { id },
    });
  }
}

export default new MaterialService();
