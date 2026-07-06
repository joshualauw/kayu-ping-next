"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import contactService from "@/lib/services/contact-service";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createContactSchema, type CreateContactSchema } from "@/lib/schemas/contacts/create-contact";

export type CreateContactResponse = number | null;

export async function createContactAction(data: CreateContactSchema): Promise<ApiResponse<CreateContactResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createContactSchema.parse(data);

    const contact = await contactService.createContact(parsed);

    return successResponse(contact.id, "Contact created successfully");
  } catch (error) {
    const response = handleError("createContactAction", error);
    return errorResponse(response.message || "Failed to create contact");
  }
}
