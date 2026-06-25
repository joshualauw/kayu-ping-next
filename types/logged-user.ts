import { Users } from "@/generated/prisma/client";

export type LoggedUser = Omit<Users, "password">;
