"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AuthorizationError, handleError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/helpers/api";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { createContactSchema } from "@/lib/schemas/contacts/create-contact";
import type { ApiResponse } from "@/types/api-response";

export type UpdateContactResponse = number | null;

export async function updateContactAction(formData: FormData): Promise<ApiResponse<UpdateContactResponse>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid contact id");
    }

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
      const phoneExist = await prisma.contact.findFirst({
        where: {
          phoneNumber,
          NOT: { id },
        },
      });
      if (phoneExist) throw new Error("Phone number already exists");
    }

    if (email) {
      const emailExist = await prisma.contact.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });
      if (emailExist) throw new Error("Email address already exists");
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        email,
        address,
        type,
        notes,
      },
    });

    return successResponse(contact.id, "Contact updated successfully");
  } catch (error) {
    const response = handleError("updateContactAction", error);
    return errorResponse(response.message || "Failed to update contact");
  }
}
