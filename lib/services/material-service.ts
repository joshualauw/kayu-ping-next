import { prisma } from "@/lib/db/prisma";
import { Material } from "@/generated/prisma/client";
import { MaterialWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateMaterialSchema } from "@/lib/schemas/materials/create-material";
import { UpdateMaterialSchema } from "@/lib/schemas/materials/update-material";

export type MaterialListItem = Material;
export type MaterialForSelect = Pick<Material, "id" | "name" | "measurement" | "code">;

class MaterialService {
  async getAllMaterials(params: TableQuery): Promise<TableResponse<MaterialListItem>> {
    const { page, size, search } = params;
    const where: MaterialWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }];
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

  async getMaterialForSelect(): Promise<MaterialForSelect[]> {
    return prisma.material.findMany({
      select: {
        id: true,
        name: true,
        measurement: true,
        code: true,
      },
    });
  }

  async checkCodeExists(code: string, excludeId?: number): Promise<boolean> {
    if (excludeId !== undefined) {
      const existing = await prisma.material.findFirst({
        where: {
          code,
          NOT: { id: excludeId },
        },
      });
      return !!existing;
    } else {
      const existing = await prisma.material.findUnique({
        where: { code },
      });
      return !!existing;
    }
  }

  async getMaterialById(id: number): Promise<Material | null> {
    return prisma.material.findUnique({
      where: { id },
    });
  }

  async createMaterial(data: CreateMaterialSchema): Promise<Material> {
    const codeExist = await this.checkCodeExists(data.code);
    if (codeExist) throw new Error("material code already exist");

    return prisma.material.create({
      data: {
        name: data.name,
        code: data.code,
        measurement: data.measurement,
      },
    });
  }

  async updateMaterial(id: number, data: UpdateMaterialSchema): Promise<Material> {
    const codeExist = await this.checkCodeExists(data.code, id);
    if (codeExist) throw new Error("material code already exist");

    return prisma.material.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
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
