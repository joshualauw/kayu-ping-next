import { prisma } from "@/lib/db/prisma";
import { Processing, Location, ProcessingItem, WoodVariant, Wood, Material, Grade, Lot } from "@/generated/prisma/client";
import type { Fee } from "@/generated/prisma/client";
import { ProcessingWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateProcessingSchema } from "@/lib/schemas/processings/create-processing";
import { UpdateProcessingSchema } from "@/lib/schemas/processings/update-processing";
import { getOrderBySort } from "@/lib/helpers/api";
import { calculateWoodVolume } from "@/lib/helpers/core";
import dayjs from "@/lib/integrations/dayjs";

export type ProcessingListItem = Processing & {
  location: Pick<Location, "name">;
};

export type ProcessingItemWithVariant = ProcessingItem & {
  grade: Grade | null;
  lot: Lot;
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
};

export type ProcessingDetail = Processing & {
  location: Location;
  items: ProcessingItemWithVariant[];
  fees: Fee[];
  totalPriceAfterFee: number;
};

class ProcessingService {
  async getAllProcessings(params: TableQuery): Promise<TableResponse<ProcessingListItem>> {
    const { page, size, search, sortBy, sortOrder, startDate, endDate } = params;
    const where: ProcessingWhereInput = {};

    if (search) {
      where.OR = [{ tid: { contains: search, mode: "insensitive" } }, { location: { name: { contains: search, mode: "insensitive" } } }];
    }

    if (startDate || endDate) {
      where.processingDate = {};
      if (startDate) {
        where.processingDate.gte = dayjs(startDate).toDate();
      }
      if (endDate) {
        where.processingDate.lte = dayjs(endDate).toDate();
      }
    }

    const allowedSortFields = ["tid", "processingDate", "totalInputVolume", "totalOutputVolume", "createdAt", "updatedAt"];
    const orderBy = getOrderBySort(sortBy, sortOrder, allowedSortFields, "processingDate", "desc");

    const [count, items] = await Promise.all([
      prisma.processing.count({ where }),
      prisma.processing.findMany({
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
        orderBy,
      }),
    ]);

    return { items, count };
  }

  async generateTid(processingDate: string | Date, tx: any = prisma): Promise<string> {
    const date = dayjs(processingDate);
    const dateStr = date.format("DDMMYY");
    const startOfDay = date.startOf("day").toDate();
    const endOfDay = date.endOf("day").toDate();

    const count = await tx.processing.count({
      where: {
        processingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, "0");
    return `T-PROCESS-${dateStr}-${sequence}`;
  }

  async createProcessing(data: CreateProcessingSchema): Promise<Processing> {
    const processingDate = dayjs(data.processingDate).toDate();

    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(processingDate, tx);

      let totalInputVolume = 0;
      let totalOutputVolume = 0;

      const groupsToProcess = [];

      for (const group of data.groups) {
        const variant = await tx.woodVariant.findUnique({
          where: { id: group.input.woodVariantId },
          include: { wood: true },
        });

        if (!variant) {
          throw new Error(`Wood variant with ID ${group.input.woodVariantId} not found.`);
        }

        const inventory = await tx.inventory.findUnique({
          where: { id: group.input.inventoryId },
        });

        if (!inventory) {
          throw new Error(`Inventory item with ID ${group.input.inventoryId} not found.`);
        }

        if (inventory.locationId !== data.locationId) {
          throw new Error(`Inventory item with ID ${group.input.inventoryId} is not at location ${data.locationId}.`);
        }

        if (inventory.stock < group.input.quantity) {
          throw new Error(
            `Insufficient stock for "${variant.wood.name}". Available: ${inventory.stock}, Requested: ${group.input.quantity}`,
          );
        }

        const inputVolume = variant.volume * group.input.quantity;
        totalInputVolume += inputVolume;

        const outputsToCreate = [];
        for (const item of group.outputs) {
          const volume = calculateWoodVolume({
            width: item.width ?? undefined,
            height: item.height ?? undefined,
            length: item.length,
            diameterSmall: item.diameterSmall ?? undefined,
            diameterLarge: item.diameterLarge ?? undefined,
            measurement: item.measurement,
          });

          const outputVolume = volume * item.quantity;
          totalOutputVolume += outputVolume;

          outputsToCreate.push({
            item,
            volume,
          });
        }

        groupsToProcess.push({
          input: {
            item: group.input,
            inventory,
            variant,
          },
          outputs: outputsToCreate,
          lotId: inventory.lotId,
        });
      }

      if (totalOutputVolume > totalInputVolume) {
        throw new Error(
          `Total output volume (${totalOutputVolume.toFixed(4)} m³) cannot exceed total input volume (${totalInputVolume.toFixed(4)} m³).`,
        );
      }

      const processing = await tx.processing.create({
        data: {
          tid,
          processingDate,
          locationId: data.locationId,
          notes: data.notes,
          totalInputVolume,
          totalOutputVolume,
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

        await tx.processingItem.create({
          data: {
            processingId: processing.id,
            woodVariantId: input.item.woodVariantId,
            gradeId: input.inventory.gradeId,
            lotId: lotId,
            type: "INPUT",
            quantity: input.item.quantity,
          },
        });

        await tx.stockMutation.create({
          data: {
            mutationDate: processingDate,
            woodVariantId: input.item.woodVariantId,
            locationId: data.locationId,
            type: "OUT",
            gradeId: input.inventory.gradeId,
            lotId: lotId,
            quantity: input.item.quantity,
            referenceType: "PROCESSING",
            referenceId: processing.id,
          },
        });

        for (const output of outputs) {
          const { item, volume } = output;

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
                volume,
              },
            });
          }

          await tx.processingItem.create({
            data: {
              processingId: processing.id,
              woodVariantId: variant.id,
              gradeId: null,
              lotId: lotId,
              type: "OUTPUT",
              quantity: item.quantity,
            },
          });

          const inventory = await tx.inventory.findFirst({
            where: {
              woodVariantId: variant.id,
              locationId: data.locationId,
              gradeId: null,
              lotId: lotId,
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
                lotId: lotId,
                stock: item.quantity,
              },
            });
          }

          await tx.stockMutation.create({
            data: {
              mutationDate: processingDate,
              woodVariantId: variant.id,
              locationId: data.locationId,
              type: "IN",
              gradeId: null,
              lotId: lotId,
              quantity: item.quantity,
              referenceType: "PROCESSING",
              referenceId: processing.id,
            },
          });
        }
      }

      return processing;
    });
  }

  async getProcessingById(id: number): Promise<ProcessingDetail | null> {
    const processing = await prisma.processing.findUnique({
      where: { id },
      include: {
        location: true,
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
          orderBy: {
            type: "asc",
          },
        },
      },
    });

    if (!processing) return null;

    const fees = await prisma.fee.findMany({
      where: {
        referenceId: id,
        referenceType: "PROCESSING",
      },
    });

    const totalPriceAfterFee = fees.reduce((sum, fee) => sum + fee.price, 0);

    return {
      ...processing,
      fees,
      totalPriceAfterFee,
    };
  }

  async updateProcessing(id: number, data: UpdateProcessingSchema): Promise<Processing> {
    return prisma.processing.update({
      where: { id },
      data: {
        notes: data.notes,
      },
    });
  }
}

export default new ProcessingService();
