import { auth } from "@/lib/auth";
import inventoryService, { InventoryListItem } from "@/lib/services/inventory-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import type { Inventory, WoodVariant, Wood, Material, Grade } from "@/generated/prisma/client";

export type LocationInventoryItem = Inventory & {
  variant: WoodVariant & {
    wood: Wood;
    material: Material;
  };
  grade: Grade | null;
};

export type GetLocationInventoryResponse = LocationInventoryItem[];

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetLocationInventoryResponse | null>>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const { searchParams } = new URL(request.url);
    const locationIdStr = searchParams.get("locationId");
    if (!locationIdStr) {
      return NextResponse.json(errorResponse("Location ID is required"), { status: 400 });
    }

    const locationId = Number(locationIdStr);
    if (isNaN(locationId)) {
      return NextResponse.json(errorResponse("Invalid Location ID"), { status: 400 });
    }

    const items = await inventoryService.getInventoryByLocation(locationId);
    return NextResponse.json(successResponse(items, "Inventories fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/inventories/by-location", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch inventories"), { status: response.code });
  }
}
