"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { updatePurchaseSchema, type UpdatePurchaseSchema } from "@/lib/schemas/purchases/update-purchase";
import purchaseService from "@/lib/services/purchase-service";

export type UpdatePurchaseResponse = number | null;

export async function updatePurchaseAction(id: number, data: UpdatePurchaseSchema): Promise<ApiResponse<UpdatePurchaseResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid purchase id");
    }

    const parsed = updatePurchaseSchema.parse(data);
    const purchase = await purchaseService.updatePurchase(id, parsed);

    return successResponse(purchase.id, "Purchase notes updated successfully");
  } catch (error) {
    const response = handleError("updatePurchaseAction", error);
    return errorResponse(response.message || "Failed to update purchase notes");
  }
}
