import { auth } from "@/lib/auth";
import inventoryService, { InventoryListItem } from "@/lib/services/inventory-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type GetAllInventoriesResponse = {
  inventories: InventoryListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllInventoriesResponse | null>>> {
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

    const { items: inventories, count } = await inventoryService.getAllInventories(parsed);

    return NextResponse.json(successResponse({ inventories, count }, "Inventories fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/inventories", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch inventories"), { status: response.code });
  }
}
