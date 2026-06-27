"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import woodService from "@/lib/services/wood-service";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createWoodSchema } from "@/lib/schemas/woods/create-wood";

export type CreateWoodResponse = number | null;

export async function createWoodAction(formData: FormData): Promise<ApiResponse<CreateWoodResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createWoodSchema.parse({
      name: formData.get("name"),
      code: formData.get("code"),
    });

    const wood = await woodService.createWood(parsed);

    return successResponse(wood.id, "Wood created successfully");
  } catch (error) {
    const response = handleError("createWoodAction", error);
    return errorResponse(response.message || "Failed to create wood");
  }
}
