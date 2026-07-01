"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { updateProcessingSchema } from "@/lib/schemas/processings/update-processing";
import processingService from "@/lib/services/processing-service";

export type UpdateProcessingResponse = number | null;

export async function updateProcessingAction(id: number, data: any): Promise<ApiResponse<UpdateProcessingResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid processing id");
    }

    const parsed = updateProcessingSchema.parse(data);
    const processing = await processingService.updateProcessing(id, parsed);

    return successResponse(processing.id, "Processing notes updated successfully");
  } catch (error) {
    const response = handleError("updateProcessingAction", error);
    return errorResponse(response.message || "Failed to update processing notes");
  }
}
