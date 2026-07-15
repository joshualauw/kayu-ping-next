import { auth } from "@/lib/auth";
import saleService, { SaleListItem } from "@/lib/services/sale-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { SaleListItem } from "@/lib/services/sale-service";

export type GetAllSalesResponse = {
  sales: SaleListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllSalesResponse | null>>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const { searchParams } = new URL(request.url);

    const parsed = tableQuerySchema.parse({
      page: searchParams.get("page"),
      size: searchParams.get("size"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    const { items: sales, count } = await saleService.getAllSales(parsed);

    return NextResponse.json(successResponse({ sales, count }, "Sales fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/sales", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch sales"), { status: response.code });
  }
}
