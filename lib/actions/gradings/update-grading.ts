"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { updateGradingSchema } from "@/lib/schemas/gradings/update-grading";
import gradingService from "@/lib/services/grading-service";

export type UpdateGradingResponse = number | null;

export async function updateGradingAction(id: number, data: any): Promise<ApiResponse<UpdateGradingResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid grading id");
    }

    const parsed = updateGradingSchema.parse(data);
    const grading = await gradingService.updateGrading(id, parsed);

    return successResponse(grading.id, "Grading notes updated successfully");
  } catch (error) {
    const response = handleError("updateGradingAction", error);
    return errorResponse(response.message || "Failed to update grading notes");
  }
}
