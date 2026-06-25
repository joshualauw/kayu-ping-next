"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { prisma } from "@/lib/db/prisma";
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

    const { name, code } = parsed;

    const codeExist = await prisma.wood.findUnique({
      where: { code },
    });
    if (codeExist) throw new Error("wood code already exist");

    const wood = await prisma.wood.create({
      data: { name, code },
    });

    return successResponse(wood.id, "Wood created successfully");
  } catch (error) {
    const response = handleError("createWoodAction", error);
    return errorResponse(response.message || "Failed to create wood");
  }
}
