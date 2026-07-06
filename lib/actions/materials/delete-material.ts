"use server";

import { auth } from "@/lib/auth";
import materialService from "@/lib/services/material-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";

export type DeleteMaterialResponse = number | null;

export async function deleteMaterialAction(id: number): Promise<ApiResponse<DeleteMaterialResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid material id");
    }

    const material = await materialService.deleteMaterial(id);

    return successResponse(material.id, "Material deleted successfully");
  } catch (error) {
    const response = handleError("deleteMaterialAction", error);
    return errorResponse(response.message || "Failed to delete material");
  }
}
