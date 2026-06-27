import { auth } from "@/lib/auth";
import purchaseService, { PurchaseListItem } from "@/lib/services/purchase-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { PurchaseListItem } from "@/lib/services/purchase-service";

export type GetAllPurchasesResponse = {
  purchases: PurchaseListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllPurchasesResponse | null>>> {
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

    const { items: purchases, count } = await purchaseService.getAllPurchases(parsed);

    return NextResponse.json(successResponse({ purchases, count }, "Purchases fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/purchases", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch purchases"), { status: response.code });
  }
}
