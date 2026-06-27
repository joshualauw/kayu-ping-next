import { prisma } from "@/lib/db/prisma";
import { Inventory, WoodVariant, Wood, Material, Location } from "@/generated/prisma/client";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { Prisma } from "@/generated/prisma/client";

export type InventoryListItem = Inventory & {
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
  location: Location;
};

class InventoryService {
  async getAllInventories(params: TableQuery): Promise<TableResponse<InventoryListItem>> {
    const { page, size, search } = params;

    const where: Prisma.InventoryWhereInput = {};

    if (search) {
      where.OR = [
        { variant: { wood: { code: { contains: search, mode: "insensitive" } } } },
        { variant: { wood: { name: { contains: search, mode: "insensitive" } } } },
        { variant: { material: { name: { contains: search, mode: "insensitive" } } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [count, items] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        include: {
          variant: {
            include: {
              wood: true,
              material: true,
            },
          },
          location: true,
        },
        skip: page * size,
        take: size,
        orderBy: {
          updatedAt: "desc",
        },
      }),
    ]);

    return { items, count };
  }
}

export default new InventoryService();
