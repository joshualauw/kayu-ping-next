import { auth } from "@/lib/auth";
import adjustmentService, { AdjustmentListItem } from "@/lib/services/adjustment-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { AdjustmentListItem } from "@/lib/services/adjustment-service";

export type GetAllAdjustmentsResponse = {
  adjustments: AdjustmentListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllAdjustmentsResponse | null>>> {
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

    const { items: adjustments, count } = await adjustmentService.getAllAdjustments(parsed);

    return NextResponse.json(successResponse({ adjustments, count }, "Adjustments fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/adjustments", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch adjustments"), { status: response.code });
  }
}
