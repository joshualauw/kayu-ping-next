"use server";

import { auth } from "@/lib/auth";
import locationService from "@/lib/services/location-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createLocationSchema, type CreateLocationSchema } from "@/lib/schemas/locations/create-location";
import type { ApiResponse } from "@/types/api-response";

export type UpdateLocationResponse = number | null;

export async function updateLocationAction(id: number, data: CreateLocationSchema): Promise<ApiResponse<UpdateLocationResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid location id");
    }

    const parsed = createLocationSchema.parse(data);

    const location = await locationService.updateLocation(id, parsed);

    return successResponse(location.id, "Location updated successfully");
  } catch (error) {
    const response = handleError("updateLocationAction", error);
    return errorResponse(response.message || "Failed to update location");
  }
}
