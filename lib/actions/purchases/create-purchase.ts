"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createPurchaseSchema } from "@/lib/schemas/purchases/create-purchase";
import purchaseService from "@/lib/services/purchase-service";

export type CreatePurchaseResponse = number | null;

export async function createPurchaseAction(data: any): Promise<ApiResponse<CreatePurchaseResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createPurchaseSchema.parse(data);
    const purchase = await purchaseService.createPurchase(parsed);

    return successResponse(purchase.id, "Purchase created successfully");
  } catch (error) {
    const response = handleError("createPurchaseAction", error);
    return errorResponse(response.message || "Failed to create purchase");
  }
}
