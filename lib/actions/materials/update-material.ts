"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createMaterialSchema } from "@/lib/schemas/materials/create-material";
import type { ApiResponse } from "@/types/api-response";

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

    const parsed = createMaterialSchema.parse({
      name: formData.get("name"),
      measurement: formData.get("measurement"),
    });

    const { name, measurement } = parsed;

    const material = await prisma.material.update({
      where: { id },
      data: {
        name,
        measurement,
      },
    });

    return successResponse(material.id, "Material updated successfully");
  } catch (error) {
    const response = handleError("updateMaterialAction", error);
    return errorResponse(response.message || "Failed to update material");
  }
}
