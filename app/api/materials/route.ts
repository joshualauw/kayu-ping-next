import { auth } from "@/lib/auth";
import materialService, { MaterialListItem } from "@/lib/services/material-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { MaterialListItem } from "@/lib/services/material-service";

export type GetAllMaterialsResponse = {
  materials: MaterialListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllMaterialsResponse | null>>> {
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

    const { items: materials, count } = await materialService.getAllMaterials(parsed);

    return NextResponse.json(successResponse({ materials, count }, "Materials fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/materials", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch materials"), { status: response.code });
  }
}
