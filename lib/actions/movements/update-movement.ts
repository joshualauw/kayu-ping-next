"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { updateMovementSchema } from "@/lib/schemas/movements/update-movement";
import movementService from "@/lib/services/movement-service";

export type UpdateMovementResponse = number | null;

export async function updateMovementAction(id: number, data: any): Promise<ApiResponse<UpdateMovementResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid movement id");
    }

    const parsed = updateMovementSchema.parse(data);
    const movement = await movementService.updateMovement(id, parsed);

    return successResponse(movement.id, "Movement notes updated successfully");
  } catch (error) {
    const response = handleError("updateMovementAction", error);
    return errorResponse(response.message || "Failed to update movement notes");
  }
}
