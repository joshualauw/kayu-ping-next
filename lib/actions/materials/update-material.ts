"use server";

import { auth } from "@/lib/auth";
import materialService from "@/lib/services/material-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { updateMaterialSchema } from "@/lib/schemas/materials/update-material";

export type UpdateMaterialResponse = number | null;

export async function updateMaterialAction(formData: FormData): Promise<ApiResponse<UpdateMaterialResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid material id");
    }

    const parsed = updateMaterialSchema.parse({
      name: formData.get("name"),
    });

    const material = await materialService.updateMaterial(id, parsed);

    return successResponse(material.id, "Material updated successfully");
  } catch (error) {
    const response = handleError("updateMaterialAction", error);
    return errorResponse(response.message || "Failed to update material");
  }
}
