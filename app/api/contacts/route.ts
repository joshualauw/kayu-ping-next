import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/helpers/user";
import { AuthorizationError, handleError } from "@/lib/errors";
import { Contact } from "@/generated/prisma/client";
import { ApiResponse } from "@/types/api-response";
import { tableQuerySchema } from "@/lib/schemas/table-query";
import { ContactWhereInput } from "@/generated/prisma/models";
import { errorResponse, successResponse } from "@/lib/helpers/api";

export type ContactListItem = Omit<Contact, "address" | "notes">;

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
    });

    const { page, size, search } = parsed;

    const where: ContactWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, rows] = await Promise.all([
      await prisma.contact.count({ where }),
      await prisma.contact.findMany({
        where,
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          email: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: page * size,
        take: size,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json(
      successResponse({ contacts: rows, count }, "Contacts fetched successfully")
    );
  } catch (error) {
    const response = handleError("GET /api/contacts", error);
    return NextResponse.json(
      errorResponse(response.message || "Failed to fetch contacts"),
      { status: response.code }
    );
  }
}
