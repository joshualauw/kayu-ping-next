"use server";

import { auth } from "@/lib/auth";
import gradeService from "@/lib/services/grade-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";

export type DeleteGradeResponse = number | null;

export async function deleteGradeAction(formData: FormData): Promise<ApiResponse<DeleteGradeResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid grade id");
    }

    const grade = await gradeService.deleteGrade(id);

    return successResponse(grade.id, "Grade deleted successfully");
  } catch (error) {
    const response = handleError("deleteGradeAction", error);
    return errorResponse(response.message || "Failed to delete grade");
  }
}
