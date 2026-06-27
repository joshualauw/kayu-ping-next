import { auth } from "@/lib/auth";
import stockMutationService, { StockMutationListItem } from "@/lib/services/stock-mutation-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type GetAllStockMutationsResponse = {
  stockMutations: StockMutationListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllStockMutationsResponse | null>>> {
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

    const { items: stockMutations, count } = await stockMutationService.getAllStockMutations(parsed);

    return NextResponse.json(successResponse({ stockMutations, count }, "Stock mutations fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/stock-mutations", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch stock mutations"), { status: response.code });
  }
}
