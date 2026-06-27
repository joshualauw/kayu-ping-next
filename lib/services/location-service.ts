import { prisma } from "@/lib/db/prisma";
import { Location } from "@/generated/prisma/client";
import { LocationWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateLocationSchema } from "@/lib/schemas/locations/create-location";

export type LocationListItem = Omit<Location, "address">;

class LocationService {
  async getAllLocations(params: TableQuery): Promise<TableResponse<LocationListItem>> {
    const { page, size, search } = params;
    const where: LocationWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

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
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return { items, count };
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
