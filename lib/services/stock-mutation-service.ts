import { prisma } from "@/lib/db/prisma";
import { StockMutation, WoodVariant, Wood, Material, Location } from "@/generated/prisma/client";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { Prisma } from "@/generated/prisma/client";

export type StockMutationListItem = StockMutation & {
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
  location: Location;
  referenceLink: string | null;
};

class StockMutationService {
  getReferenceLink(type: string, id: number | null): string | null {
    if (!id) return null;
    if (type === "PURCHASE") {
      return `/admin/purchases/${id}`;
    }
    return null;
  }

  async getAllStockMutations(params: TableQuery): Promise<TableResponse<StockMutationListItem>> {
    const { page, size, search } = params;

    const where: Prisma.StockMutationWhereInput = {};

    if (search) {
      where.OR = [
        { variant: { wood: { code: { contains: search, mode: "insensitive" } } } },
        { variant: { wood: { name: { contains: search, mode: "insensitive" } } } },
        { variant: { material: { name: { contains: search, mode: "insensitive" } } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, items] = await Promise.all([
      prisma.stockMutation.count({ where }),
      prisma.stockMutation.findMany({
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
          mutationDate: "desc",
        },
      }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        referenceLink: this.getReferenceLink(item.referenceType, item.referenceId),
      })),
      count,
    };
  }
}

export default new StockMutationService();
