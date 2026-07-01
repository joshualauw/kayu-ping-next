import { prisma } from "@/lib/db/prisma";
import { Processing, Location } from "@/generated/prisma/client";
import { ProcessingWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";

export type ProcessingListItem = Processing & {
  location: Pick<Location, "name">;
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
}

export default new ProcessingService();
