"use server";

import { auth } from "@/lib/auth";
import locationService from "@/lib/services/location-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";

export type DeleteLocationResponse = number | null;

export async function deleteLocationAction(id: number): Promise<ApiResponse<DeleteLocationResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid location id");
    }

    const location = await locationService.deleteLocation(id);

    return successResponse(location.id, "Location deleted successfully");
  } catch (error) {
    const response = handleError("deleteLocationAction", error);
    return errorResponse(response.message || "Failed to delete location");
  }
}
