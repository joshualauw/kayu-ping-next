import { prisma } from "@/lib/db/prisma";
import { Sale, Location, Contact, WoodVariant, Wood, Material, SaleItem, Grade } from "@/generated/prisma/client";
import { SaleWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateSaleSchema } from "@/lib/schemas/sales/create-sale";
import { UpdateSaleSchema } from "@/lib/schemas/sales/update-sale";
import dayjs from "@/lib/integrations/dayjs";

export type SaleListItem = Sale & {
  location: Pick<Location, "name">;
  customer: Pick<Contact, "name">;
};

export type SaleItemWithVariant = SaleItem & {
  grade: Grade | null;
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
};

export type SaleDetail = Sale & {
  location: Location;
  customer: Contact;
  items: SaleItemWithVariant[];
};

class SaleService {
  async getAllSales(params: TableQuery): Promise<TableResponse<SaleListItem>> {
    const { page, size, search } = params;
    const where: SaleWhereInput = {};

    if (search) {
      where.OR = [{ tid: { contains: search, mode: "insensitive" } }, { location: { name: { contains: search, mode: "insensitive" } } }];
    }

    const [count, items] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        include: {
          location: {
            select: {
              name: true,
            },
          },
          customer: {
            select: {
              name: true,
            },
          },
        },
        skip: page * size,
        take: size,
        orderBy: {
          saleDate: "desc",
        },
      }),
    ]);

    return { items, count };
  }

  async getSaleById(id: number): Promise<SaleDetail | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        location: true,
        customer: true,
        items: {
          include: {
            grade: true,
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

  async generateTid(saleDate: string | Date, tx: any = prisma): Promise<string> {
    const date = dayjs(saleDate);
    const dateStr = date.format("DDMMYY");
    const startOfDay = date.startOf("day").toDate();
    const endOfDay = date.endOf("day").toDate();

    const count = await tx.sale.count({
      where: {
        saleDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, "0");
    return `T-SALE-${dateStr}-${sequence}`;
  }

  async createSale(data: CreateSaleSchema): Promise<Sale> {
    const saleDate = new Date(data.saleDate);

    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(saleDate, tx);

      let totalVolume = 0;
      let totalPrice = 0;

      const itemsToCreate = [];
      for (const item of data.items) {
        const variant = await tx.woodVariant.findUnique({
          where: { id: item.woodVariantId },
          include: {
            wood: true,
          },
        });

        if (!variant) {
          throw new Error(`Wood variant with ID ${item.woodVariantId} not found.`);
        }

        const inventory = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
        });

        if (!inventory) {
          throw new Error(`Inventory item with ID ${item.inventoryId} not found.`);
        }

        if (inventory.locationId !== data.locationId) {
          throw new Error(`Inventory item with ID ${item.inventoryId} is not at location ${data.locationId}.`);
        }

        if (inventory.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${variant.wood.name}". Available: ${inventory.stock}, Requested: ${item.quantity}`);
        }

        const itemVolume = variant.volume * item.quantity;
        const itemSubtotal = itemVolume * item.pricePerCubic;

        totalVolume += itemVolume;
        totalPrice += itemSubtotal;

        itemsToCreate.push({
          item,
          inventory,
          variant,
        });
      }

      const sale = await tx.sale.create({
        data: {
          tid,
          customerId: data.customerId,
          saleDate,
          locationId: data.locationId,
          notes: data.notes,
          totalVolume,
          totalPrice,
        },
      });

      for (const { item, inventory } of itemsToCreate) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            stock: inventory.stock - item.quantity,
          },
        });

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            woodVariantId: item.woodVariantId,
            gradeId: inventory.gradeId,
            pricePerCubic: item.pricePerCubic,
            quantity: item.quantity,
          },
        });

        await tx.stockMutation.create({
          data: {
            mutationDate: saleDate,
            woodVariantId: item.woodVariantId,
            locationId: data.locationId,
            type: "OUT",
            gradeId: inventory.gradeId,
            quantity: item.quantity,
            referenceType: "SALES",
            referenceId: sale.id,
          },
        });
      }

      return sale;
    });
  }

  async updateSale(id: number, data: UpdateSaleSchema): Promise<Sale> {
    return prisma.sale.update({
      where: { id },
      data: {
        notes: data.notes,
      },
    });
  }
}

export default new SaleService();
