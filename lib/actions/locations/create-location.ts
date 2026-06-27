"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import locationService from "@/lib/services/location-service";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createLocationSchema } from "@/lib/schemas/locations/create-location";

export type CreateLocationResponse = number | null;

export async function createLocationAction(formData: FormData): Promise<ApiResponse<CreateLocationResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createLocationSchema.parse({
      name: formData.get("name"),
      address: formData.get("address"),
      type: formData.get("type"),
    });

    const location = await locationService.createLocation(parsed);

    return successResponse(location.id, "Location created successfully");
  } catch (error) {
    const response = handleError("createLocationAction", error);
    return errorResponse(response.message || "Failed to create location");
  }
}
