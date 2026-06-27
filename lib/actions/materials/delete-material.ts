"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";

export type DeleteMaterialResponse = number | null;

export async function deleteMaterialAction(formData: FormData): Promise<ApiResponse<DeleteMaterialResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid material id");
    }

    const material = await prisma.material.delete({
      where: { id },
    });

    return successResponse(material.id, "Material deleted successfully");
  } catch (error) {
    const response = handleError("deleteMaterialAction", error);
    return errorResponse(response.message || "Failed to delete material");
  }
}
