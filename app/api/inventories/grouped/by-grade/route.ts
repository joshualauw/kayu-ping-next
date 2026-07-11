import { auth } from "@/lib/auth";
import inventoryService, { InventoryGroupedByGradeItem } from "@/lib/services/inventory-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type GetGroupedInventoriesByGradeResponse = {
  inventories: InventoryGroupedByGradeItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetGroupedInventoriesByGradeResponse | null>>> {
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

    const { items: inventories, count } = await inventoryService.getAllInventoriesByGrade(parsed);

    return NextResponse.json(successResponse({ inventories, count }, "Inventories by grade fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/inventories/grouped/by-grade", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch inventories"), { status: response.code });
  }
}
