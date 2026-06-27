"use server";

import { auth } from "@/lib/auth";
import woodService from "@/lib/services/wood-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createWoodSchema } from "@/lib/schemas/woods/create-wood";
import type { ApiResponse } from "@/types/api-response";

export type UpdateWoodResponse = number | null;

export async function updateWoodAction(formData: FormData): Promise<ApiResponse<UpdateWoodResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid wood id");
    }

    const parsed = createWoodSchema.parse({
      name: formData.get("name"),
      code: formData.get("code"),
    });

    const wood = await woodService.updateWood(id, parsed);

    return successResponse(wood.id, "Wood updated successfully");
  } catch (error) {
    const response = handleError("updateWoodAction", error);
    return errorResponse(response.message || "Failed to update wood");
  }
}
