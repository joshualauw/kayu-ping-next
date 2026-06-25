"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createLocationSchema } from "@/lib/schemas/locations/create-location";
import type { ApiResponse } from "@/types/api-response";

export type UpdateLocationResponse = number | null;

export async function updateLocationAction(formData: FormData): Promise<ApiResponse<UpdateLocationResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid location id");
    }

    const parsed = createLocationSchema.parse({
      name: formData.get("name"),
      address: formData.get("address"),
      type: formData.get("type"),
    });

    const { name, address, type } = parsed;

    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        address,
        type,
      },
    });

    return successResponse(location.id, "Location updated successfully");
  } catch (error) {
    const response = handleError("updateLocationAction", error);
    return errorResponse(response.message || "Failed to update location");
  }
}
