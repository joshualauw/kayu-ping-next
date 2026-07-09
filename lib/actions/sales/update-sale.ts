"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { updateSaleSchema, type UpdateSaleSchema } from "@/lib/schemas/sales/update-sale";
import saleService from "@/lib/services/sale-service";

export type UpdateSaleResponse = number | null;

export async function updateSaleAction(id: number, data: UpdateSaleSchema): Promise<ApiResponse<UpdateSaleResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid sale id");
    }

    const parsed = updateSaleSchema.parse(data);
    const sale = await saleService.updateSale(id, parsed);

    return successResponse(sale.id, "Sale notes updated successfully");
  } catch (error) {
    const response = handleError("updateSaleAction", error);
    return errorResponse(response.message || "Failed to update sale notes");
  }
}
