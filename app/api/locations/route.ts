import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { Location } from "@/generated/prisma/client";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { LocationWhereInput } from "@/generated/prisma/models";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type LocationListItem = Omit<Location, "address">;

export type GetAllLocationsResponse = {
  locations: LocationListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllLocationsResponse | null>>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const { searchParams } = new URL(request.url);

    const parsed = tableQuerySchema.parse({
      page: searchParams.get("page"),
      size: searchParams.get("size"),
      search: searchParams.get("search"),
    });

    const { page, size, search } = parsed;

    const where: LocationWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, rows] = await Promise.all([
      await prisma.location.count({ where }),
      await prisma.location.findMany({
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

    return NextResponse.json(
      successResponse({ locations: rows, count }, "Locations fetched successfully")
    );
  } catch (error) {
    const response = handleError("GET /api/locations", error);
    return NextResponse.json(
      errorResponse(response.message || "Failed to fetch locations"),
      { status: response.code }
    );
  }
}
