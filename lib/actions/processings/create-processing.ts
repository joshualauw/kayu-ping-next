"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createProcessingSchema, type CreateProcessingSchema } from "@/lib/schemas/processings/create-processing";
import processingService from "@/lib/services/processing-service";

export type CreateProcessingResponse = null;

export async function createProcessingAction(data: CreateProcessingSchema): Promise<ApiResponse<CreateProcessingResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createProcessingSchema.parse(data);
    await processingService.createProcessing(parsed);

    return successResponse(null, "Processing logged successfully");
  } catch (error) {
    const response = handleError("createProcessingAction", error);
    return errorResponse(response.message || "Failed to create processing record");
  }
}
