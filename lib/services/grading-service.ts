import { prisma } from "@/lib/db/prisma";
import { Grading, Location, GradingItem, WoodVariant, Wood, Material, Grade } from "@/generated/prisma/client";
import { GradingWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateGradingSchema } from "@/lib/schemas/gradings/create-grading";
import { UpdateGradingSchema } from "@/lib/schemas/gradings/update-grading";
import dayjs from "@/lib/integrations/dayjs";

export type GradingListItem = Grading & {
  location: Pick<Location, "name">;
};

export type GradingItemWithDetails = GradingItem & {
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
  grade: Grade | null;
};

export type GradingDetail = Grading & {
  location: Location;
  items: GradingItemWithDetails[];
};

class GradingService {
  async getAllGradings(params: TableQuery): Promise<TableResponse<GradingListItem>> {
    const { page, size, search } = params;
    const where: GradingWhereInput = {};

    if (search) {
      where.OR = [{ tid: { contains: search, mode: "insensitive" } }, { location: { name: { contains: search, mode: "insensitive" } } }];
    }

    const [count, items] = await Promise.all([
      prisma.grading.count({ where }),
      prisma.grading.findMany({
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
          gradingDate: "desc",
        },
      }),
    ]);

    return { items, count };
  }

  async generateTid(gradingDate: string | Date, tx: any = prisma): Promise<string> {
    const date = dayjs(gradingDate);
    const dateStr = date.format("DDMMYY");
    const startOfDay = date.startOf("day").toDate();
    const endOfDay = date.endOf("day").toDate();

    const count = await tx.grading.count({
      where: {
        gradingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, "0");
    return `T-GRADE-${dateStr}-${sequence}`;
  }

  async createGrading(data: CreateGradingSchema): Promise<Grading> {
    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(data.gradingDate, tx);

      const inputsToProcess = [];
      for (const item of data.beforeItems) {
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

        if (inventory.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${inventory.variant.wood.name}". Available: ${inventory.stock}, Requested: ${item.quantity}`,
          );
        }

        inputsToProcess.push({
          item,
          inventory,
        });
      }

      const grading = await tx.grading.create({
        data: {
          tid,
          gradingDate: new Date(data.gradingDate),
          locationId: data.locationId,
          notes: data.notes,
        },
      });

      for (const { item, inventory } of inputsToProcess) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            stock: inventory.stock - item.quantity,
          },
        });

        await tx.gradingItem.create({
          data: {
            gradingId: grading.id,
            woodVariantId: item.woodVariantId,
            gradeId: item.gradeId,
            type: "BEFORE",
            quantity: item.quantity,
          },
        });

        await tx.stockMutation.create({
          data: {
            mutationDate: new Date(data.gradingDate),
            woodVariantId: item.woodVariantId,
            locationId: data.locationId,
            type: "OUT",
            gradeId: item.gradeId,
            quantity: item.quantity,
            referenceType: "GRADING",
            referenceId: grading.id,
          },
        });
      }

      for (const item of data.afterItems) {
        await tx.gradingItem.create({
          data: {
            gradingId: grading.id,
            woodVariantId: item.woodVariantId,
            gradeId: item.gradeId,
            type: "AFTER",
            quantity: item.quantity,
            comment: item.comment,
          },
        });

        const inventory = await tx.inventory.findFirst({
          where: {
            woodVariantId: item.woodVariantId,
            locationId: data.locationId,
            gradeId: item.gradeId,
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
              woodVariantId: item.woodVariantId,
              locationId: data.locationId,
              gradeId: item.gradeId,
              stock: item.quantity,
            },
          });
        }

        await tx.stockMutation.create({
          data: {
            mutationDate: new Date(data.gradingDate),
            woodVariantId: item.woodVariantId,
            locationId: data.locationId,
            type: "IN",
            gradeId: item.gradeId,
            quantity: item.quantity,
            referenceType: "GRADING",
            referenceId: grading.id,
          },
        });
      }

      return grading;
    });
  }

  async getGradingById(id: number): Promise<GradingDetail | null> {
    return prisma.grading.findUnique({
      where: { id },
      include: {
        location: true,
        items: {
          include: {
            variant: {
              include: {
                wood: true,
                material: true,
              },
            },
            grade: true,
          },
          orderBy: {
            type: "asc",
          },
        },
      },
    });
  }

  async updateGrading(id: number, data: UpdateGradingSchema): Promise<Grading> {
    return prisma.grading.update({
      where: { id },
      data: {
        notes: data.notes,
      },
    });
  }
}

export default new GradingService();
