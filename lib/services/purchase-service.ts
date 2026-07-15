import { prisma } from "@/lib/db/prisma";
import { Purchase, Location, Contact, PurchaseItem, WoodVariant, Wood, Material, Grade, Lot } from "@/generated/prisma/client";
import { PurchaseWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreatePurchaseSchema } from "@/lib/schemas/purchases/create-purchase";
import { UpdatePurchaseSchema } from "@/lib/schemas/purchases/update-purchase";
import { getOrderBySort } from "@/lib/helpers/api";
import { calculateWoodVolume } from "@/lib/helpers/core";
import dayjs from "@/lib/integrations/dayjs";

export type PurchaseListItem = Purchase & {
  location: Pick<Location, "name">;
  supplier: Pick<Contact, "name">;
};

export type PurchaseDetail = Purchase & {
  location: Location;
  supplier: Contact;
  items: PurchaseItemWithVariant[];
};

export type PurchaseItemWithVariant = PurchaseItem & {
  grade: Grade | null;
  lot: Lot;
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
};

class PurchaseService {
  async getAllPurchases(params: TableQuery): Promise<TableResponse<PurchaseListItem>> {
    const { page, size, search, sortBy, sortOrder, startDate, endDate } = params;
    const where: PurchaseWhereInput = {};

    if (search) {
      where.OR = [{ tid: { contains: search, mode: "insensitive" } }, { location: { name: { contains: search, mode: "insensitive" } } }];
    }

    if (startDate || endDate) {
      where.purchaseDate = {};
      if (startDate) {
        where.purchaseDate.gte = dayjs(startDate).toDate();
      }
      if (endDate) {
        where.purchaseDate.lte = dayjs(endDate).toDate();
      }
    }

    const allowedSortFields = ["tid", "purchaseDate", "totalPrice", "totalVolume", "createdAt", "updatedAt"];
    const orderBy = getOrderBySort(sortBy, sortOrder, allowedSortFields, "purchaseDate", "desc");

    const [count, items] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        include: {
          location: {
            select: {
              name: true,
            },
          },
          supplier: {
            select: {
              name: true,
            },
          },
        },
        skip: page * size,
        take: size,
        orderBy,
      }),
    ]);

    return { items, count };
  }

  async getPurchaseById(id: number): Promise<PurchaseDetail | null> {
    return prisma.purchase.findUnique({
      where: { id },
      include: {
        location: true,
        supplier: true,
        items: {
          include: {
            grade: true,
            lot: true,
            variant: {
              include: {
                wood: true,
                material: true,
              },
            },
          },
        },
      },
    });
  }

  async generateTid(purchaseDate: string | Date, tx: any = prisma): Promise<string> {
    const date = dayjs(purchaseDate);
    const dateStr = date.format("DDMMYY");
    const startOfDay = date.startOf("day").toDate();
    const endOfDay = date.endOf("day").toDate();

    const count = await tx.purchase.count({
      where: {
        purchaseDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, "0");
    return `T-PURCHASE-${dateStr}-${sequence}`;
  }

  async createPurchase(data: CreatePurchaseSchema): Promise<Purchase> {
    const purchaseDate = dayjs(data.purchaseDate).toDate();

    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(purchaseDate, tx);

      let totalVolume = 0;
      let totalPrice = 0;

      const dateStr = dayjs(purchaseDate).format("DDMMYY");
      const prefix = `LOT-${dateStr}-`;
      const existingCount = await tx.lot.count({
        where: {
          code: {
            startsWith: prefix,
          },
        },
      });

      const flattenedItems: any[] = [];
      let lotCounter = existingCount;

      for (const group of data.groups) {
        lotCounter++;
        const lotCode = `LOT-${dateStr}-${String(lotCounter).padStart(3, "0")}`;
        const lot = await tx.lot.create({
          data: {
            code: lotCode,
            createdAt: purchaseDate,
          },
        });

        for (const item of group.items) {
          const volume = calculateWoodVolume({
            width: item.width ?? undefined,
            height: item.height ?? undefined,
            length: item.length,
            diameterSmall: item.diameterSmall ?? undefined,
            diameterLarge: item.diameterLarge ?? undefined,
            measurement: item.measurement,
          });

          const itemTotalVolume = volume * item.quantity;
          const itemSubtotal = itemTotalVolume * item.pricePerCubic;

          totalVolume += itemTotalVolume;
          totalPrice += itemSubtotal;

          flattenedItems.push({
            ...item,
            volume,
            lotId: lot.id,
          });
        }
      }

      const purchase = await tx.purchase.create({
        data: {
          tid,
          supplierId: data.supplierId,
          purchaseDate,
          locationId: data.locationId,
          notes: data.notes,
          totalVolume,
          totalPrice,
        },
      });

      for (const item of flattenedItems) {
        let variant = await tx.woodVariant.findFirst({
          where: {
            woodId: item.woodId,
            materialId: item.materialId,
            width: item.width,
            height: item.height,
            diameterSmall: item.diameterSmall,
            diamterLarge: item.diameterLarge,
            length: item.length,
          },
        });

        if (!variant) {
          variant = await tx.woodVariant.create({
            data: {
              woodId: item.woodId,
              materialId: item.materialId,
              width: item.width,
              height: item.height,
              diameterSmall: item.diameterSmall,
              diamterLarge: item.diameterLarge,
              length: item.length,
              volume: item.volume,
            },
          });
        }

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            woodVariantId: variant.id,
            pricePerCubic: item.pricePerCubic,
            quantity: item.quantity,
            gradeId: null,
            lotId: item.lotId,
          },
        });

        const inventory = await tx.inventory.findFirst({
          where: {
            woodVariantId: variant.id,
            locationId: data.locationId,
            gradeId: null,
            lotId: item.lotId,
          },
        });

        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              stock: inventory.stock + item.quantity,
            },
          });
        } else {
          await tx.inventory.create({
            data: {
              woodVariantId: variant.id,
              locationId: data.locationId,
              gradeId: null,
              lotId: item.lotId,
              stock: item.quantity,
            },
          });
        }

        await tx.stockMutation.create({
          data: {
            mutationDate: purchaseDate,
            woodVariantId: variant.id,
            locationId: data.locationId,
            type: "IN",
            quantity: item.quantity,
            gradeId: null,
            lotId: item.lotId,
            referenceType: "PURCHASE",
            referenceId: purchase.id,
          },
        });
      }

      return purchase;
    });
  }

  async updatePurchase(id: number, data: UpdatePurchaseSchema): Promise<Purchase> {
    return prisma.purchase.update({
      where: { id },
      data: {
        notes: data.notes,
      },
    });
  }
}

export default new PurchaseService();
