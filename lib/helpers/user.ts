import { Users } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getAuthenticatedUser(userId?: number): Promise<Omit<Users, "password"> | null> {
  if (!userId) {
    return null;
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}
