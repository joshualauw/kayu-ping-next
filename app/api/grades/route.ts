import { auth } from "@/lib/auth";
import gradeService, { GradeListItem } from "@/lib/services/grade-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type GetAllGradesResponse = {
  grades: GradeListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllGradesResponse | null>>> {
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
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    const { items: grades, count } = await gradeService.getAllGrades(parsed);

    return NextResponse.json(successResponse({ grades, count }, "Grades fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/grades", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch grades"), { status: response.code });
  }
}
