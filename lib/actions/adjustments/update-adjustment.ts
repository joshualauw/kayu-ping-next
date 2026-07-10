"use server";

import { auth } from "@/lib/auth";
import adjustmentService from "@/lib/services/adjustment-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { updateAdjustmentSchema, type UpdateAdjustmentSchema } from "@/lib/schemas/adjustments/update-adjustment";
import type { ApiResponse } from "@/types/api-response";

export type UpdateAdjustmentResponse = number | null;

export async function updateAdjustmentAction(id: number, data: UpdateAdjustmentSchema): Promise<ApiResponse<UpdateAdjustmentResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid adjustment id");
    }

    const parsed = updateAdjustmentSchema.parse(data);
    const adjustment = await adjustmentService.updateAdjustment(id, parsed);

    return successResponse(adjustment.id, "Adjustment notes updated successfully");
  } catch (error) {
    const response = handleError("updateAdjustmentAction", error);
    return errorResponse(response.message || "Failed to update adjustment notes");
  }
}
