"use server";

import { auth } from "@/lib/auth";
import gradeService from "@/lib/services/grade-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createGradeSchema, type CreateGradeSchema } from "@/lib/schemas/grades/create-grade";
import type { ApiResponse } from "@/types/api-response";

export type UpdateGradeResponse = number | null;

export async function updateGradeAction(id: number, data: CreateGradeSchema): Promise<ApiResponse<UpdateGradeResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid grade id");
    }

    const parsed = createGradeSchema.parse(data);
    const grade = await gradeService.updateGrade(id, parsed);

    return successResponse(grade.id, "Grade updated successfully");
  } catch (error) {
    const response = handleError("updateGradeAction", error);
    return errorResponse(response.message || "Failed to update grade");
  }
}
