"use server";

import { auth } from "@/lib/auth";
import woodService from "@/lib/services/wood-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";

export type DeleteWoodResponse = number | null;

export async function deleteWoodAction(id: number): Promise<ApiResponse<DeleteWoodResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid wood id");
    }

    const wood = await woodService.deleteWood(id);

    return successResponse(wood.id, "Wood deleted successfully");
  } catch (error) {
    const response = handleError("deleteWoodAction", error);
    return errorResponse(response.message || "Failed to delete wood");
  }
}
