"use server";

import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { prisma } from "@/lib/db/prisma";
import type { ApiResponse } from "@/types/api-response";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { createContactSchema } from "@/lib/schemas/contacts/create-contact";

export type CreateContactResponse = number | null;

export async function createContactAction(formData: FormData): Promise<ApiResponse<CreateContactResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const parsed = createContactSchema.parse({
      name: formData.get("name"),
      phoneNumber: formData.get("phoneNumber"),
      email: formData.get("email"),
      address: formData.get("address"),
      type: formData.get("type"),
      notes: formData.get("notes"),
    });

    const { name, phoneNumber, email, address, type, notes } = parsed;

    if (phoneNumber) {
      const phoneExist = await prisma.contact.findUnique({
        where: { phoneNumber },
      });
      if (phoneExist) throw new Error("Phone number already exists");
    }

    if (email) {
      const emailExist = await prisma.contact.findUnique({
        where: { email },
      });
      if (emailExist) throw new Error("Email address already exists");
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        phoneNumber,
        email,
        address,
        type,
        notes,
      },
    });

    return successResponse(contact.id, "Contact created successfully");
  } catch (error) {
    const response = handleError("createContactAction", error);
    return errorResponse(response.message || "Failed to create contact");
  }
}
