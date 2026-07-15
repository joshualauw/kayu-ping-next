import { auth } from "@/lib/auth";
import gradingService, { GradingListItem } from "@/lib/services/grading-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { GradingListItem } from "@/lib/services/grading-service";

export type GetAllGradingsResponse = {
  gradings: GradingListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllGradingsResponse | null>>> {
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

    const { items: gradings, count } = await gradingService.getAllGradings(parsed);

    return NextResponse.json(successResponse({ gradings, count }, "Gradings fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/gradings", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch gradings"), { status: response.code });
  }
}
