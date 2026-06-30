"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createSaleSchema } from "@/lib/schemas/sales/create-sale";
import saleService from "@/lib/services/sale-service";

export type CreateSaleResponse = number | null;

export async function createSaleAction(data: any): Promise<ApiResponse<CreateSaleResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createSaleSchema.parse(data);
    const sale = await saleService.createSale(parsed);

    return successResponse(sale.id, "Sale created successfully");
  } catch (error) {
    const response = handleError("createSaleAction", error);
    return errorResponse(response.message || "Failed to create sale");
  }
}
