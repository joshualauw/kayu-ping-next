import { auth } from "@/lib/auth";
import movementService, { MovementListItem } from "@/lib/services/movement-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { MovementListItem } from "@/lib/services/movement-service";

export type GetAllMovementsResponse = {
  movements: MovementListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllMovementsResponse | null>>> {
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

    const { items: movements, count } = await movementService.getAllMovements(parsed);

    return NextResponse.json(successResponse({ movements, count }, "Movements fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/movements", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch movements"), { status: response.code });
  }
}
