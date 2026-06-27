import { prisma } from "@/lib/db/prisma";
import { Purchase, Contact, Location, PurchaseItem, WoodVariant, Wood, Material } from "@/generated/prisma/client";
import { PurchaseWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreatePurchaseSchema } from "@/lib/schemas/purchases/create-purchase";
import { UpdatePurchaseSchema } from "@/lib/schemas/purchases/update-purchase";
import dayjs from "@/lib/integrations/dayjs";
import { calculateWoodVolume, calculateWoodTotalVolume, calculateSubtotal } from "@/lib/helpers/wood-volume";

export type PurchaseListItem = Purchase & {
  contact: Pick<Contact, "name">;
  location: Pick<Location, "name">;
};

export type PurchaseDetail = Purchase & {
  contact: Contact;
  location: Location;
  items: PurchaseItemWithVariant[];
};

export type PurchaseItemWithVariant = PurchaseItem & {
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
};

class PurchaseService {
  async getAllPurchases(params: TableQuery): Promise<TableResponse<PurchaseListItem>> {
    const { page, size, search } = params;
    const where: PurchaseWhereInput = {};

    if (search) {
      where.OR = [
        { tid: { contains: search, mode: "insensitive" } },
        { contact: { name: { contains: search, mode: "insensitive" } } },
        { location: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [count, items] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        include: {
          contact: {
            select: {
              name: true,
            },
          },
          location: {
            select: {
              name: true,
            },
          },
        },
        skip: page * size,
        take: size,
        orderBy: {
          purchaseDate: "desc",
        },
      }),
    ]);

    return { items, count };
  }

  async getPurchaseById(id: number): Promise<PurchaseDetail | null> {
    return prisma.purchase.findUnique({
      where: { id },
      include: {
        contact: true,
        location: true,
        items: {
          include: {
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
    return `T-BELI-${dateStr}-${sequence}`;
  }

  async createPurchase(data: CreatePurchaseSchema): Promise<Purchase> {
    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(data.purchaseDate, tx);

      let totalVolume = 0;
      let totalPrice = 0;

      const itemsWithVolume = await Promise.all(
        data.items.map(async (item) => {
          const volume = calculateWoodVolume({
            width: item.width ?? undefined,
            height: item.height ?? undefined,
            length: item.length,
            diameterSmall: item.diameterSmall ?? undefined,
            diameterLarge: item.diameterLarge ?? undefined,
            measurement: item.measurement,
          });

          const itemTotalVolume = calculateWoodTotalVolume(volume, item.quantity);
          const itemSubtotal = calculateSubtotal(volume, item.pricePerCubic, item.quantity);

          totalVolume += itemTotalVolume;
          totalPrice += itemSubtotal;

          return { ...item, volume };
        }),
      );

      const purchase = await tx.purchase.create({
        data: {
          tid,
          purchaseDate: new Date(data.purchaseDate),
          contactId: data.contactId,
          locationId: data.locationId,
          notes: data.notes,
          totalVolume,
          totalPrice,
          paymentStatus: data.paymentStatus,
        },
      });

      for (const item of itemsWithVolume) {
        let variant = await tx.woodVariant.findFirst({
          where: {
            woodId: item.woodId,
            materialId: item.materialId,
            width: item.width ?? null,
            height: item.height ?? null,
            diameterSmall: item.diameterSmall ?? null,
            diamterLarge: item.diameterLarge ?? null,
            length: item.length,
          },
        });

        if (!variant) {
          variant = await tx.woodVariant.create({
            data: {
              woodId: item.woodId,
              materialId: item.materialId,
              width: item.width ?? null,
              height: item.height ?? null,
              diameterSmall: item.diameterSmall ?? null,
              diamterLarge: item.diameterLarge ?? null,
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
          },
        });

        const inventory = await tx.inventory.findFirst({
          where: {
            woodVariantId: variant.id,
            locationId: data.locationId,
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
              stock: item.quantity,
            },
          });
        }

        await tx.stockMutation.create({
          data: {
            mutationDate: new Date(data.purchaseDate),
            woodVariantId: variant.id,
            locationId: data.locationId,
            type: "IN",
            quantity: item.quantity,
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
