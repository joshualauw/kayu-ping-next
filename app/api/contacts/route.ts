import { auth } from "@/lib/auth";
import contactService, { ContactListItem } from "@/lib/services/contact-service";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type { ContactListItem } from "@/lib/services/contact-service";

export type GetAllContactsResponse = {
  contacts: ContactListItem[];
  count: number;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GetAllContactsResponse | null>>> {
  try {
    const session = await auth();
    const user = await getAuthenticatedUser(session?.user?.id);
    if (!user) throw new AuthorizationError();

    const { searchParams } = new URL(request.url);

    const parsed = tableQuerySchema.parse({
      page: searchParams.get("page"),
      size: searchParams.get("size"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    const { items: contacts, count } = await contactService.getAllContacts(parsed);

    return NextResponse.json(successResponse({ contacts, count }, "Contacts fetched successfully"));
  } catch (error) {
    const response = handleError("GET /api/contacts", error);
    return NextResponse.json(errorResponse(response.message || "Failed to fetch contacts"), { status: response.code });
  }
}
