"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { prisma } from "@/lib/db/prisma";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createMaterialSchema } from "@/lib/schemas/materials/create-material";

export type CreateMaterialResponse = number | null;

export async function createMaterialAction(formData: FormData): Promise<ApiResponse<CreateMaterialResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createMaterialSchema.parse({
      name: formData.get("name"),
      measurement: formData.get("measurement"),
    });

    const { name, measurement } = parsed;

    const material = await prisma.material.create({
      data: {
        name,
        measurement,
      },
    });

    return successResponse(material.id, "Material created successfully");
  } catch (error) {
    const response = handleError("createMaterialAction", error);
    return errorResponse(response.message || "Failed to create material");
  }
}
