"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import feeService from "@/lib/services/fee-service";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createFeeSchema, type CreateFeeSchema } from "@/lib/schemas/fees/create-fee";

export type CreateFeeResponse = number | null;

export async function createFeeAction(data: CreateFeeSchema): Promise<ApiResponse<CreateFeeResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createFeeSchema.parse(data);
    const fee = await feeService.createFee(parsed);

    return successResponse(fee.id, "Fee added successfully");
  } catch (error) {
    const response = handleError("createFeeAction", error);
    return errorResponse(response.message || "Failed to add fee");
  }
}
