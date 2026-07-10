"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createAdjustmentSchema, type CreateAdjustmentSchema } from "@/lib/schemas/adjustments/create-adjustment";
import adjustmentService from "@/lib/services/adjustment-service";

export type CreateAdjustmentResponse = number | null;

export async function createAdjustmentAction(data: CreateAdjustmentSchema): Promise<ApiResponse<CreateAdjustmentResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createAdjustmentSchema.parse(data);
    const adjustment = await adjustmentService.createAdjustment(parsed);

    return successResponse(adjustment.id, "Adjustment logged successfully");
  } catch (error) {
    const response = handleError("createAdjustmentAction", error);
    return errorResponse(response.message || "Failed to create adjustment");
  }
}
