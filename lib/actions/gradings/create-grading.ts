"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createGradingSchema } from "@/lib/schemas/gradings/create-grading";
import type { ApiResponse } from "@/types/api-response";

import gradingService from "@/lib/services/grading-service";

export type CreateGradingResponse = null;

export async function createGradingAction(data: any): Promise<ApiResponse<CreateGradingResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createGradingSchema.parse(data);
    await gradingService.createGrading(parsed);

    return successResponse(null, "Grading transaction logged successfully");
  } catch (error) {
    const response = handleError("createGradingAction", error);
    return errorResponse(response.message || "Failed to create grading");
  }
}
