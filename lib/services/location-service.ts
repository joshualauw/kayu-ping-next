import { prisma } from "@/lib/db/prisma";
import { Location } from "@/generated/prisma/client";
import { LocationWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateLocationSchema } from "@/lib/schemas/locations/create-location";
import { getOrderBySort } from "@/lib/helpers/api";
import dayjs from "@/lib/integrations/dayjs";

export type LocationListItem = Omit<Location, "address">;
export type LocationForSelect = Pick<Location, "id" | "name">;

class LocationService {
  async getAllLocations(params: TableQuery): Promise<TableResponse<LocationListItem>> {
    const { page, size, search, sortBy, sortOrder, startDate, endDate } = params;
    const where: LocationWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = dayjs(startDate).toDate();
      }
      if (endDate) {
        where.createdAt.lte = dayjs(endDate).toDate();
      }
    }

    const allowedSortFields = ["name", "type", "createdAt", "updatedAt"];
    const orderBy = getOrderBySort(sortBy, sortOrder, allowedSortFields);

    const [count, items] = await Promise.all([
      prisma.location.count({ where }),
      prisma.location.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: page * size,
        take: size,
        orderBy,
      }),
    ]);

    return { items, count };
  }

  async getLocationsForSelect(): Promise<LocationForSelect[]> {
    return prisma.location.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getLocationById(id: number): Promise<Location | null> {
    return prisma.location.findUnique({
      where: { id },
    });
  }

  async createLocation(data: CreateLocationSchema): Promise<Location> {
    return prisma.location.create({
      data: {
        name: data.name,
        address: data.address,
        type: data.type,
      },
    });
  }

  async updateLocation(id: number, data: CreateLocationSchema): Promise<Location> {
    return prisma.location.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        type: data.type,
      },
    });
  }

  async deleteLocation(id: number): Promise<Location> {
    return prisma.location.delete({
      where: { id },
    });
  }
}

export default new LocationService();
