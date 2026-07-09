"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import gradeService from "@/lib/services/grade-service";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createGradeSchema, type CreateGradeSchema } from "@/lib/schemas/grades/create-grade";

export type CreateGradeResponse = number | null;

export async function createGradeAction(data: CreateGradeSchema): Promise<ApiResponse<CreateGradeResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createGradeSchema.parse(data);
    const grade = await gradeService.createGrade(parsed);

    return successResponse(grade.id, "Grade created successfully");
  } catch (error) {
    const response = handleError("createGradeAction", error);
    return errorResponse(response.message || "Failed to create grade");
  }
}
