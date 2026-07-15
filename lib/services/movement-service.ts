import { prisma } from "@/lib/db/prisma";
import { Movement, Location, Contact, MovementItem, WoodVariant, Wood, Material, Grade, Lot } from "@/generated/prisma/client";
import { MovementWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateMovementSchema } from "@/lib/schemas/movements/create-movement";
import { UpdateMovementSchema } from "@/lib/schemas/movements/update-movement";
import dayjs from "@/lib/integrations/dayjs";
import { getOrderBySort } from "@/lib/helpers/api";

export type MovementListItem = Movement & {
  trucker: Pick<Contact, "name">;
  fromLocation: Pick<Location, "name">;
  toLocation: Pick<Location, "name">;
};

export type MovementItemWithVariant = MovementItem & {
  grade: Grade | null;
  lot: Lot;
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
};

export type MovementDetail = Movement & {
  trucker: Contact;
  fromLocation: Location;
  toLocation: Location;
  items: MovementItemWithVariant[];
};

class MovementService {
  async getAllMovements(params: TableQuery): Promise<TableResponse<MovementListItem>> {
    const { page, size, search, sortBy, sortOrder, startDate, endDate } = params;
    const where: MovementWhereInput = {};

    if (search) {
      where.OR = [
        { tid: { contains: search, mode: "insensitive" } },
        { trucker: { name: { contains: search, mode: "insensitive" } } },
        { fromLocation: { name: { contains: search, mode: "insensitive" } } },
        { toLocation: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (startDate || endDate) {
      where.movementDate = {};
      if (startDate) {
        where.movementDate.gte = dayjs(startDate).toDate();
      }
      if (endDate) {
        where.movementDate.lte = dayjs(endDate).toDate();
      }
    }

    const allowedSortFields = ["tid", "movementDate", "totalMovedVolume", "createdAt", "updatedAt"];
    const orderBy = getOrderBySort(sortBy, sortOrder, allowedSortFields, "movementDate", "desc");

    const [count, items] = await Promise.all([
      prisma.movement.count({ where }),
      prisma.movement.findMany({
        where,
        include: {
          trucker: {
            select: {
              name: true,
            },
          },
          fromLocation: {
            select: {
              name: true,
            },
          },
          toLocation: {
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

  async generateTid(movementDate: string | Date, tx: any = prisma): Promise<string> {
    const date = dayjs(movementDate);
    const dateStr = date.format("DDMMYY");
    const startOfDay = date.startOf("day").toDate();
    const endOfDay = date.endOf("day").toDate();

    const count = await tx.movement.count({
      where: {
        movementDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, "0");
    return `T-MOVE-${dateStr}-${sequence}`;
  }

  async createMovement(data: CreateMovementSchema): Promise<Movement> {
    const movementDate = dayjs(data.movementDate).toDate();

    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(movementDate, tx);

      let totalMovedVolume = 0;

      const itemsToProcess = [];
      for (const item of data.items) {
        const variant = await tx.woodVariant.findUnique({
          where: { id: item.woodVariantId },
          include: { wood: true },
        });

        if (!variant) {
          throw new Error(`Wood variant with ID ${item.woodVariantId} not found.`);
        }

        const sourceInventory = await tx.inventory.findUnique({
          where: {
            id: item.inventoryId,
          },
        });

        if (!sourceInventory || sourceInventory.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${variant.wood.name}" at source location. Available: ${sourceInventory?.stock ?? 0}, Requested: ${item.quantity}`,
          );
        }

        const volume = variant.volume * item.quantity;
        totalMovedVolume += volume;

        itemsToProcess.push({
          item,
          sourceInventory,
          variant,
        });
      }

      const movement = await tx.movement.create({
        data: {
          tid,
          truckerId: data.truckerId,
          movementDate,
          fromLocationId: data.fromLocationId,
          toLocationId: data.toLocationId,
          notes: data.notes,
          totalMovedVolume,
        },
      });

      for (const { item, sourceInventory } of itemsToProcess) {
        await tx.inventory.update({
          where: { id: sourceInventory.id },
          data: {
            stock: sourceInventory.stock - item.quantity,
          },
        });

        await tx.stockMutation.create({
          data: {
            mutationDate: movementDate,
            woodVariantId: item.woodVariantId,
            locationId: data.fromLocationId,
            type: "OUT",
            quantity: item.quantity,
            gradeId: sourceInventory.gradeId,
            lotId: sourceInventory.lotId,
            referenceType: "MOVEMENT",
            referenceId: movement.id,
          },
        });

        await tx.movementItem.create({
          data: {
            movementId: movement.id,
            woodVariantId: item.woodVariantId,
            quantity: item.quantity,
            gradeId: sourceInventory.gradeId,
            lotId: sourceInventory.lotId,
          },
        });

        const destInventory = await tx.inventory.findFirst({
          where: {
            woodVariantId: item.woodVariantId,
            locationId: data.toLocationId,
            gradeId: sourceInventory.gradeId,
            lotId: sourceInventory.lotId,
          },
        });

        if (destInventory) {
          await tx.inventory.update({
            where: { id: destInventory.id },
            data: {
              stock: destInventory.stock + item.quantity,
            },
          });
        } else {
          await tx.inventory.create({
            data: {
              woodVariantId: item.woodVariantId,
              locationId: data.toLocationId,
              gradeId: sourceInventory.gradeId,
              lotId: sourceInventory.lotId,
              stock: item.quantity,
            },
          });
        }

        await tx.stockMutation.create({
          data: {
            mutationDate: movementDate,
            woodVariantId: item.woodVariantId,
            locationId: data.toLocationId,
            type: "IN",
            quantity: item.quantity,
            gradeId: sourceInventory.gradeId,
            lotId: sourceInventory.lotId,
            referenceType: "MOVEMENT",
            referenceId: movement.id,
          },
        });
      }

      return movement;
    });
  }

  async getMovementById(id: number): Promise<MovementDetail | null> {
    return prisma.movement.findUnique({
      where: { id },
      include: {
        trucker: true,
        fromLocation: true,
        toLocation: true,
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

  async updateMovement(id: number, data: UpdateMovementSchema): Promise<Movement> {
    return prisma.movement.update({
      where: { id },
      data: {
        notes: data.notes,
      },
    });
  }
}

export default new MovementService();
