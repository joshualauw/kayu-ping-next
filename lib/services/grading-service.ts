import { prisma } from "@/lib/db/prisma";
import { Grading, Location, GradingItem, WoodVariant, Wood, Material, Grade, Lot } from "@/generated/prisma/client";
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
  lot: Lot;
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
    const gradingDate = new Date(data.gradingDate);

    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(gradingDate, tx);

      const groupsToProcess = [];
      for (const group of data.groups) {
        const inventory = await tx.inventory.findUnique({
          where: { id: group.input.inventoryId },
          include: {
            variant: {
              include: { wood: true },
            },
          },
        });

        if (!inventory) {
          throw new Error(`Inventory item with ID ${group.input.inventoryId} not found.`);
        }

        if (inventory.stock < group.input.quantity) {
          throw new Error(
            `Insufficient stock for "${inventory.variant.wood.name}". Available: ${inventory.stock}, Requested: ${group.input.quantity}`,
          );
        }

        groupsToProcess.push({
          input: {
            item: group.input,
            inventory,
          },
          outputs: group.outputs,
          lotId: inventory.lotId,
        });
      }

      const grading = await tx.grading.create({
        data: {
          tid,
          gradingDate,
          locationId: data.locationId,
          notes: data.notes,
        },
      });

      for (const group of groupsToProcess) {
        const { input, outputs, lotId } = group;

        await tx.inventory.update({
          where: { id: input.inventory.id },
          data: {
            stock: input.inventory.stock - input.item.quantity,
          },
        });

        await tx.gradingItem.create({
          data: {
            gradingId: grading.id,
            woodVariantId: input.item.woodVariantId,
            gradeId: input.item.gradeId,
            lotId: lotId,
            type: "BEFORE",
            quantity: input.item.quantity,
          },
        });

        await tx.stockMutation.create({
          data: {
            mutationDate: gradingDate,
            woodVariantId: input.item.woodVariantId,
            locationId: data.locationId,
            type: "OUT",
            gradeId: input.item.gradeId,
            lotId: lotId,
            quantity: input.item.quantity,
            referenceType: "GRADING",
            referenceId: grading.id,
          },
        });

        for (const output of outputs) {
          await tx.gradingItem.create({
            data: {
              gradingId: grading.id,
              woodVariantId: output.woodVariantId,
              gradeId: output.gradeId,
              lotId: lotId,
              type: "AFTER",
              quantity: output.quantity,
              comment: output.comment,
            },
          });

          const inventory = await tx.inventory.findFirst({
            where: {
              woodVariantId: output.woodVariantId,
              locationId: data.locationId,
              gradeId: output.gradeId,
              lotId: lotId,
            },
          });

          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: {
                stock: inventory.stock + output.quantity,
              },
            });
          } else {
            await tx.inventory.create({
              data: {
                woodVariantId: output.woodVariantId,
                locationId: data.locationId,
                gradeId: output.gradeId,
                lotId: lotId,
                stock: output.quantity,
              },
            });
          }

          await tx.stockMutation.create({
            data: {
              mutationDate: gradingDate,
              woodVariantId: output.woodVariantId,
              locationId: data.locationId,
              type: "IN",
              gradeId: output.gradeId,
              lotId: lotId,
              quantity: output.quantity,
              referenceType: "GRADING",
              referenceId: grading.id,
            },
          });
        }
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
            lot: true,
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
