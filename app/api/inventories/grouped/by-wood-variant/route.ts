import { auth } from "@/lib/auth";
import inventoryService, { InventoryGroupedByVariantItem } from "@/lib/services/inventory-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type GetGroupedInventoriesResponse = {
  inventories: InventoryGroupedByVariantItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetGroupedInventoriesResponse | null>>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const { searchParams } = new URL(request.url);
    const showEmptyInventory = searchParams.get("showEmptyInventory") === "true";

    const parsed = tableQuerySchema.parse({
      page: searchParams.get("page"),
      size: searchParams.get("size"),
      search: searchParams.get("search"),
    });

    const { items: inventories, count } = await inventoryService.getAllInventoriesByWoodVariant(parsed, showEmptyInventory);

    return NextResponse.json(successResponse({ inventories, count }, "Inventories by wood variant fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/inventories/by-wood-variant", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch inventories"), { status: response.code });
  }
}
