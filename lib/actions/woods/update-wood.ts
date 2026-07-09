"use server";

import { auth } from "@/lib/auth";
import woodService from "@/lib/services/wood-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createWoodSchema, type CreateWoodSchema } from "@/lib/schemas/woods/create-wood";
import type { ApiResponse } from "@/types/api-response";

export type UpdateWoodResponse = number | null;

export async function updateWoodAction(id: number, data: CreateWoodSchema): Promise<ApiResponse<UpdateWoodResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid wood id");
    }

    const parsed = createWoodSchema.parse(data);
    const wood = await woodService.updateWood(id, parsed);

    return successResponse(wood.id, "Wood updated successfully");
  } catch (error) {
    const response = handleError("updateWoodAction", error);
    return errorResponse(response.message || "Failed to update wood");
  }
}
