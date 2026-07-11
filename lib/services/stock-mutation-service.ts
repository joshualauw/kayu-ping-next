import { prisma } from "@/lib/db/prisma";
import { StockMutation, WoodVariant, Wood, Material, Location, Grade, MutationType, ReferenceType } from "@/generated/prisma/client";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { Prisma } from "@/generated/prisma/client";

export type StockMutationGroupedItem = {
  id: string;
  mutationDate: Date;
  referenceType: ReferenceType;
  referenceId: number;
  items: Array<{
    id: number;
    variant: WoodVariant & {
      wood: Wood;
      material: Material;
    };
    grade: Grade | null;
    type: MutationType;
    location: Location;
    quantity: number;
  }>;
};

class StockMutationService {
  async getAllStockMutations(params: TableQuery): Promise<TableResponse<StockMutationGroupedItem>> {
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

    const countResult = await prisma.stockMutation.groupBy({
      by: ["referenceType", "referenceId"],
      where,
    });
    const count = countResult.length;

    const groups = await prisma.stockMutation.groupBy({
      by: ["referenceType", "referenceId"],
      where,
      _max: {
        mutationDate: true,
      },
      orderBy: {
        _max: {
          mutationDate: "desc",
        },
      },
      skip: page * size,
      take: size,
    });

    if (groups.length === 0) {
      return { items: [], count };
    }

    const items = await prisma.stockMutation.findMany({
      where: {
        OR: groups.map((g) => ({
          referenceType: g.referenceType,
          referenceId: g.referenceId,
        })),
      },
      include: {
        variant: {
          include: {
            wood: true,
            material: true,
          },
        },
        location: true,
        grade: true,
      },
      orderBy: {
        mutationDate: "desc",
      },
    });

    const groupedItems: StockMutationGroupedItem[] = groups.map((g) => {
      const groupItems = items.filter((item) => item.referenceType === g.referenceType && item.referenceId === g.referenceId);

      return {
        id: `${g.referenceType}-${g.referenceId}`,
        mutationDate: g._max.mutationDate ?? groupItems[0]?.mutationDate ?? new Date(),
        referenceType: g.referenceType,
        referenceId: g.referenceId,
        items: groupItems.map((item) => ({
          id: item.id,
          variant: item.variant,
          grade: item.grade,
          type: item.type,
          location: item.location,
          quantity: item.quantity,
        })),
      };
    });

    return { items: groupedItems, count };
  }
}

export default new StockMutationService();
