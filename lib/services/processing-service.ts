import { prisma } from "@/lib/db/prisma";
import { Processing, Location, ProcessingItem, WoodVariant, Wood, Material, Grade } from "@/generated/prisma/client";
import { ProcessingWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateProcessingSchema } from "@/lib/schemas/processings/create-processing";
import { UpdateProcessingSchema } from "@/lib/schemas/processings/update-processing";
import { calculateWoodVolume } from "@/lib/helpers/core";
import dayjs from "@/lib/integrations/dayjs";

export type ProcessingListItem = Processing & {
  location: Pick<Location, "name">;
};

export type ProcessingItemWithVariant = ProcessingItem & {
  grade: Grade | null;
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
};

export type ProcessingDetail = Processing & {
  location: Location;
  items: ProcessingItemWithVariant[];
};

class ProcessingService {
  async getAllProcessings(params: TableQuery): Promise<TableResponse<ProcessingListItem>> {
    const { page, size, search } = params;
    const where: ProcessingWhereInput = {};

    if (search) {
      where.OR = [{ tid: { contains: search, mode: "insensitive" } }, { location: { name: { contains: search, mode: "insensitive" } } }];
    }

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
        orderBy: {
          processingDate: "desc",
        },
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
    const processingDate = new Date(data.processingDate);

    return prisma.$transaction(async (tx) => {
      const tid = await this.generateTid(processingDate, tx);

      let totalInputVolume = 0;
      let totalOutputVolume = 0;

      const inputsToProcess = [];
      for (const item of data.inputItems) {
        const variant = await tx.woodVariant.findUnique({
          where: { id: item.woodVariantId },
          include: { wood: true },
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
        totalInputVolume += itemVolume;

        inputsToProcess.push({
          item,
          inventory,
          variant,
        });
      }

      const outputsToCreate = [];
      for (const item of data.outputItems) {
        const volume = calculateWoodVolume({
          width: item.width ?? undefined,
          height: item.height ?? undefined,
          length: item.length,
          diameterSmall: item.diameterSmall ?? undefined,
          diameterLarge: item.diameterLarge ?? undefined,
          measurement: item.measurement,
        });

        const itemTotalVolume = volume * item.quantity;
        totalOutputVolume += itemTotalVolume;

        outputsToCreate.push({
          item,
          volume,
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

      for (const { item, inventory } of inputsToProcess) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            stock: inventory.stock - item.quantity,
          },
        });

        await tx.processingItem.create({
          data: {
            processingId: processing.id,
            woodVariantId: item.woodVariantId,
            gradeId: inventory.gradeId,
            type: "INPUT",
            quantity: item.quantity,
          },
        });

        await tx.stockMutation.create({
          data: {
            mutationDate: processingDate,
            woodVariantId: item.woodVariantId,
            locationId: data.locationId,
            type: "OUT",
            gradeId: inventory.gradeId,
            quantity: item.quantity,
            referenceType: "PROCESSING",
            referenceId: processing.id,
          },
        });
      }

      for (const { item, volume } of outputsToCreate) {
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
            type: "OUTPUT",
            quantity: item.quantity,
          },
        });

        const inventory = await tx.inventory.findFirst({
          where: {
            woodVariantId: variant.id,
            locationId: data.locationId,
            gradeId: null,
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
            quantity: item.quantity,
            referenceType: "PROCESSING",
            referenceId: processing.id,
          },
        });
      }

      return processing;
    });
  }

  async getProcessingById(id: number): Promise<ProcessingDetail | null> {
    return prisma.processing.findUnique({
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
          orderBy: {
            type: "asc",
          },
        },
      },
    });
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
