"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import materialService from "@/lib/services/material-service";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createMaterialSchema, type CreateMaterialSchema } from "@/lib/schemas/materials/create-material";

export type CreateMaterialResponse = number | null;

export async function createMaterialAction(data: CreateMaterialSchema): Promise<ApiResponse<CreateMaterialResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createMaterialSchema.parse(data);
    const material = await materialService.createMaterial(parsed);

    return successResponse(material.id, "Material created successfully");
  } catch (error) {
    const response = handleError("createMaterialAction", error);
    return errorResponse(response.message || "Failed to create material");
  }
}
