"use server";

import { auth } from "@/lib/auth";
import contactService from "@/lib/services/contact-service";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createContactSchema, type CreateContactSchema } from "@/lib/schemas/contacts/create-contact";
import type { ApiResponse } from "@/types/api-response";

export type UpdateContactResponse = number | null;

export async function updateContactAction(id: number, data: CreateContactSchema): Promise<ApiResponse<UpdateContactResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid contact id");
    }

    const parsed = createContactSchema.parse(data);
    const contact = await contactService.updateContact(id, parsed);

    return successResponse(contact.id, "Contact updated successfully");
  } catch (error) {
    const response = handleError("updateContactAction", error);
    return errorResponse(response.message || "Failed to update contact");
  }
}
