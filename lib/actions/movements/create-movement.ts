"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createMovementSchema, type CreateMovementSchema } from "@/lib/schemas/movements/create-movement";
import movementService from "@/lib/services/movement-service";

export type CreateMovementResponse = null;

export async function createMovementAction(data: CreateMovementSchema): Promise<ApiResponse<CreateMovementResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createMovementSchema.parse(data);
    await movementService.createMovement(parsed);

    return successResponse(null, "Movement created successfully");
  } catch (error) {
    const response = handleError("createMovementAction", error);
    return errorResponse(response.message || "Failed to create movement record");
  }
}
