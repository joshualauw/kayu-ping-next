"use server";

import { auth } from "@/lib/auth";
import contactService from "@/lib/services/contact-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import type { ApiResponse } from "@/types/api-response";

export type DeleteContactResponse = number | null;

export async function deleteContactAction(formData: FormData): Promise<ApiResponse<DeleteContactResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid contact id");
    }

    const contact = await contactService.deleteContact(id);

    return successResponse(contact.id, "Contact deleted successfully");
  } catch (error) {
    const response = handleError("deleteContactAction", error);
    return errorResponse(response.message || "Failed to delete contact");
  }
}
