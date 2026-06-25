import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { Wood } from "@/generated/prisma/client";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { WoodWhereInput } from "@/generated/prisma/models";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type GetAllWoodsResponse = {
  woods: Wood[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllWoodsResponse | null>>> {
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

    const where: WoodWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }];
    }

    const [count, rows] = await Promise.all([
      await prisma.wood.count({ where }),
      await prisma.wood.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json(successResponse({ woods: rows, count }, "Woods fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/woods", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch woods"), { status: response.code });
  }
}
