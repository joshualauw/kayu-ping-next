import { prisma } from "@/lib/db/prisma";
import { Adjustment, Location, AdjustmentItem, WoodVariant, Wood, Material, Grade } from "@/generated/prisma/client";
import { AdjustmentWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateAdjustmentSchema } from "@/lib/schemas/adjustments/create-adjustment";
import { UpdateAdjustmentSchema } from "@/lib/schemas/adjustments/update-adjustment";
import dayjs from "@/lib/integrations/dayjs";

export type AdjustmentListItem = Adjustment & {
  location: Pick<Location, "name">;
};

export type AdjustmentItemWithDetails = AdjustmentItem & {
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
  grade: Grade | null;
};

export type AdjustmentDetail = Adjustment & {
  location: Location;
  items: AdjustmentItemWithDetails[];
};

class AdjustmentService {
  async getAllAdjustments(params: TableQuery): Promise<TableResponse<AdjustmentListItem>> {
    const { page, size, search } = params;
    const where: AdjustmentWhereInput = {};

    if (search) {
      where.OR = [
        { tid: { contains: search, mode: "insensitive" } },
        { location: { name: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, items] = await Promise.all([
      prisma.adjustment.count({ where }),
      prisma.adjustment.findMany({
        where,
        include: {
          location: {
            select: {
              name: true,
            },
          },
        },
        skip: page * size,
        take: size,
        orderBy: {
          adjustmentDate: "desc",
        },
      }),
    ]);

    return { items, count };
  }

  async generateTid(adjustmentDate: string | Date, tx: any = prisma): Promise<string> {
    const date = dayjs(adjustmentDate);
    const dateStr = date.format("DDMMYY");
    const startOfDay = date.startOf("day").toDate();
    const endOfDay = date.endOf("day").toDate();

    const count = await tx.adjustment.count({
      where: {
        adjustmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, "0");
    return `T-ADJUST-${dateStr}-${sequence}`;
  }

  async createAdjustment(data: CreateAdjustmentSchema): Promise<Adjustment> {
    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(data.adjustmentDate, tx);

      const itemsToProcess = [];
      for (const item of data.items) {
        const inventory = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
          include: {
            variant: {
              include: { wood: true },
            },
          },
        });

        if (!inventory) {
          throw new Error(`Inventory item with ID ${item.inventoryId} not found.`);
        }

        if (inventory.locationId !== data.locationId) {
          throw new Error(`Inventory item "${inventory.variant.wood.name}" is not at the target location.`);
        }

        if (item.type === "SUBTRACT" && inventory.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${inventory.variant.wood.name}". Available: ${inventory.stock}, Requested: ${item.quantity}`,
          );
        }

        itemsToProcess.push({
          item,
          inventory,
        });
      }

      const adjustment = await tx.adjustment.create({
        data: {
          tid,
          adjustmentDate: new Date(data.adjustmentDate),
          locationId: data.locationId,
          notes: data.notes,
        },
      });

      for (const { item, inventory } of itemsToProcess) {
        const stockChange = item.type === "ADD" ? item.quantity : -item.quantity;
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            stock: inventory.stock + stockChange,
          },
        });

        await tx.adjustmentItem.create({
          data: {
            adjustmentId: adjustment.id,
            woodVariantId: item.woodVariantId,
            gradeId: inventory.gradeId,
            quantity: item.quantity,
            type: item.type,
            reason: item.reason,
            comment: item.comment,
          },
        });

        await tx.stockMutation.create({
          data: {
            mutationDate: new Date(data.adjustmentDate),
            woodVariantId: item.woodVariantId,
            locationId: data.locationId,
            gradeId: inventory.gradeId,
            type: item.type === "ADD" ? "IN" : "OUT",
            quantity: item.quantity,
            referenceType: "ADJUSTMENT",
            referenceId: adjustment.id,
          },
        });
      }

      return adjustment;
    });
  }

  async getAdjustmentById(id: number): Promise<AdjustmentDetail | null> {
    return prisma.adjustment.findUnique({
      where: { id },
      include: {
        location: true,
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

  async updateAdjustment(id: number, data: UpdateAdjustmentSchema): Promise<Adjustment> {
    return prisma.adjustment.update({
      where: { id },
      data: {
        notes: data.notes,
      },
    });
  }
}

export default new AdjustmentService();
