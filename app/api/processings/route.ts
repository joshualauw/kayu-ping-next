import { auth } from "@/lib/auth";
import processingService, { ProcessingListItem } from "@/lib/services/processing-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { ProcessingListItem } from "@/lib/services/processing-service";

export type GetAllProcessingsResponse = {
  processings: ProcessingListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllProcessingsResponse | null>>> {
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

    const { items: processings, count } = await processingService.getAllProcessings(parsed);

    return NextResponse.json(successResponse({ processings, count }, "Processings fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/processings", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch processings"), { status: response.code });
  }
}
