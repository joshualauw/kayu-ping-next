import { prisma } from "@/lib/db/prisma";
import { WoodVariant, Wood, Material, Location, Grade, Lot } from "@/generated/prisma/client";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { Prisma } from "@/generated/prisma/client";

export type InventoryGroupedByVariantItem = {
  id: number;
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
  totalVolume: number;
  totalStock: number;
  items: Array<{
    id: number;
    grade: Grade | null;
    lot: Lot;
    location: Location;
    volume: number;
    stock: number;
  }>;
};

export type InventoryGroupedByLocationItem = {
  id: number;
  location: Location;
  totalVolume: number;
  totalStock: number;
  items: Array<{
    id: number;
    variant: WoodVariant & {
      wood: Wood;
      material: Material;
    };
    grade: Grade | null;
    lot: Lot;
    volume: number;
    stock: number;
  }>;
};

export type InventoryGroupedByGradeItem = {
  id: string;
  grade: Grade | null;
  totalVolume: number;
  totalStock: number;
  items: Array<{
    id: number;
    variant: WoodVariant & {
      wood: Wood;
      material: Material;
    };
    location: Location;
    grade: Grade | null;
    lot: Lot;
    volume: number;
    stock: number;
  }>;
};

export type InventoryGroupedByLotItem = {
  id: number;
  lot: Lot;
  totalVolume: number;
  totalStock: number;
  originPurchaseId: number;
  items: Array<{
    id: number;
    variant: WoodVariant & {
      wood: Wood;
      material: Material;
    };
    location: Location;
    grade: Grade | null;
    lot: Lot;
    volume: number;
    stock: number;
  }>;
};

class InventoryService {
  async getAllInventoriesByWoodVariant(
    params: TableQuery,
    showEmptyInventory: boolean = false,
  ): Promise<TableResponse<InventoryGroupedByVariantItem>> {
    const { page, size, search } = params;

    const where: Prisma.InventoryWhereInput = {};

    if (!showEmptyInventory) {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { variant: { wood: { code: { contains: search, mode: "insensitive" } } } },
        { variant: { wood: { name: { contains: search, mode: "insensitive" } } } },
        { variant: { material: { name: { contains: search, mode: "insensitive" } } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const countResult = await prisma.inventory.groupBy({
      by: ["woodVariantId"],
      where,
    });
    const count = countResult.length;

    const groups = await prisma.inventory.groupBy({
      by: ["woodVariantId"],
      where,
      _max: {
        updatedAt: true,
      },
      orderBy: {
        _max: {
          updatedAt: "desc",
        },
      },
      skip: page * size,
      take: size,
    });

    if (groups.length === 0) {
      return { items: [], count };
    }

    const items = await prisma.inventory.findMany({
      where: {
        AND: [
          {
            woodVariantId: {
              in: groups.map((g) => g.woodVariantId),
            },
          },
          ...(showEmptyInventory ? [] : [{ stock: { gt: 0 } }]),
        ],
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
        lot: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const groupedItems: InventoryGroupedByVariantItem[] = groups.map((g) => {
      const groupItems = items.filter((item) => item.woodVariantId === g.woodVariantId);
      const totalStock = groupItems.reduce((sum, item) => sum + item.stock, 0);
      const variant = groupItems[0].variant;
      const totalVolume = variant.volume * totalStock;

      return {
        id: g.woodVariantId,
        variant,
        totalVolume,
        totalStock,
        items: groupItems.map((item) => ({
          id: item.id,
          grade: item.grade,
          lot: item.lot,
          location: item.location,
          volume: variant.volume * item.stock,
          stock: item.stock,
        })),
      };
    });

    return { items: groupedItems, count };
  }

  async getAllInventoriesByLocation(
    params: TableQuery,
    showEmptyInventory: boolean = false,
  ): Promise<TableResponse<InventoryGroupedByLocationItem>> {
    const { page, size, search } = params;

    const where: Prisma.InventoryWhereInput = {};

    if (!showEmptyInventory) {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { variant: { wood: { code: { contains: search, mode: "insensitive" } } } },
        { variant: { wood: { name: { contains: search, mode: "insensitive" } } } },
        { variant: { material: { name: { contains: search, mode: "insensitive" } } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const countResult = await prisma.inventory.groupBy({
      by: ["locationId"],
      where,
    });
    const count = countResult.length;

    const groups = await prisma.inventory.groupBy({
      by: ["locationId"],
      where,
      _max: {
        updatedAt: true,
      },
      orderBy: {
        _max: {
          updatedAt: "desc",
        },
      },
      skip: page * size,
      take: size,
    });

    if (groups.length === 0) {
      return { items: [], count };
    }

    const items = await prisma.inventory.findMany({
      where: {
        AND: [
          {
            locationId: {
              in: groups.map((g) => g.locationId),
            },
          },
          ...(showEmptyInventory ? [] : [{ stock: { gt: 0 } }]),
        ],
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
        lot: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const groupedItems: InventoryGroupedByLocationItem[] = groups.map((g) => {
      const groupItems = items.filter((item) => item.locationId === g.locationId);
      const totalStock = groupItems.reduce((sum, item) => sum + item.stock, 0);
      const totalVolume = groupItems.reduce((sum, item) => sum + item.variant.volume * item.stock, 0);
      const location = groupItems[0].location;

      return {
        id: g.locationId,
        location,
        totalVolume,
        totalStock,
        items: groupItems.map((item) => ({
          id: item.id,
          variant: item.variant,
          grade: item.grade,
          lot: item.lot,
          volume: item.variant.volume * item.stock,
          stock: item.stock,
        })),
      };
    });

    return { items: groupedItems, count };
  }

  async getAllInventoriesByGrade(
    params: TableQuery,
    showEmptyInventory: boolean = false,
  ): Promise<TableResponse<InventoryGroupedByGradeItem>> {
    const { page, size, search } = params;

    const where: Prisma.InventoryWhereInput = {};

    if (!showEmptyInventory) {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { variant: { wood: { code: { contains: search, mode: "insensitive" } } } },
        { variant: { wood: { name: { contains: search, mode: "insensitive" } } } },
        { variant: { material: { name: { contains: search, mode: "insensitive" } } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const countResult = await prisma.inventory.groupBy({
      by: ["gradeId"],
      where,
    });
    const count = countResult.length;

    const groups = await prisma.inventory.groupBy({
      by: ["gradeId"],
      where,
      _max: {
        updatedAt: true,
      },
      orderBy: {
        _max: {
          updatedAt: "desc",
        },
      },
      skip: page * size,
      take: size,
    });

    if (groups.length === 0) {
      return { items: [], count };
    }

    const items = await prisma.inventory.findMany({
      where: {
        AND: [
          {
            OR: groups.map((g) => ({
              gradeId: g.gradeId,
            })),
          },
          ...(showEmptyInventory ? [] : [{ stock: { gt: 0 } }]),
        ],
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
        lot: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const groupedItems: InventoryGroupedByGradeItem[] = groups.map((g) => {
      const groupItems = items.filter((item) => item.gradeId === g.gradeId);
      const totalStock = groupItems.reduce((sum, item) => sum + item.stock, 0);
      const totalVolume = groupItems.reduce((sum, item) => sum + item.variant.volume * item.stock, 0);
      const grade = groupItems[0]?.grade ?? null;

      return {
        id: g.gradeId === null ? "ungraded" : String(g.gradeId),
        grade,
        totalVolume,
        totalStock,
        items: groupItems.map((item) => ({
          id: item.id,
          variant: item.variant,
          location: item.location,
          grade: item.grade,
          lot: item.lot,
          volume: item.variant.volume * item.stock,
          stock: item.stock,
        })),
      };
    });

    return { items: groupedItems, count };
  }

  async getAllInventoriesByLot(params: TableQuery, showEmptyInventory: boolean = false): Promise<TableResponse<InventoryGroupedByLotItem>> {
    const { page, size, search } = params;

    const where: Prisma.InventoryWhereInput = {};

    if (!showEmptyInventory) {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { variant: { wood: { code: { contains: search, mode: "insensitive" } } } },
        { variant: { wood: { name: { contains: search, mode: "insensitive" } } } },
        { variant: { material: { name: { contains: search, mode: "insensitive" } } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
        { lot: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    const countResult = await prisma.inventory.groupBy({
      by: ["lotId"],
      where,
    });
    const count = countResult.length;

    const groups = await prisma.inventory.groupBy({
      by: ["lotId"],
      where,
      _max: {
        updatedAt: true,
      },
      orderBy: {
        _max: {
          updatedAt: "desc",
        },
      },
      skip: page * size,
      take: size,
    });

    if (groups.length === 0) {
      return { items: [], count };
    }

    const items = await prisma.inventory.findMany({
      where: {
        AND: [
          {
            lotId: {
              in: groups.map((g) => g.lotId),
            },
          },
          ...(showEmptyInventory ? [] : [{ stock: { gt: 0 } }]),
        ],
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
        lot: {
          include: {
            purchaseItems: {
              select: {
                purchaseId: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const groupedItems: InventoryGroupedByLotItem[] = groups.map((g) => {
      const groupItems = items.filter((item) => item.lotId === g.lotId);
      const totalStock = groupItems.reduce((sum, item) => sum + item.stock, 0);
      const totalVolume = groupItems.reduce((sum, item) => sum + item.variant.volume * item.stock, 0);
      const lot = groupItems[0].lot;
      const originPurchaseId = lot.purchaseItems[0].purchaseId;

      return {
        id: g.lotId,
        lot,
        totalVolume,
        totalStock,
        originPurchaseId,
        items: groupItems.map((item) => ({
          id: item.id,
          variant: item.variant,
          location: item.location,
          grade: item.grade,
          lot: item.lot,
          volume: item.variant.volume * item.stock,
          stock: item.stock,
        })),
      };
    });

    return { items: groupedItems, count };
  }

  async getInventoryByLocation(locationId: number, showEmptyInventory: boolean = false) {
    const where: Prisma.InventoryWhereInput = {
      locationId,
    };

    if (!showEmptyInventory) {
      where.stock = { gt: 0 };
    }

    return await prisma.inventory.findMany({
      where,
      include: {
        variant: {
          include: {
            wood: true,
            material: true,
          },
        },
        grade: true,
        lot: true,
      },
    });
  }
}

export default new InventoryService();
