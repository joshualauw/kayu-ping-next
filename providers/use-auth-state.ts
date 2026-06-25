"use client";

import { LoggedUser } from "@/types/logged-user";
import { useState } from "react";

export interface UseAuthStateProps {
  user: LoggedUser;
}

export function useAuthState({ user: initialUser }: UseAuthStateProps) {
  const [user, setUser] = useState<LoggedUser | null>(initialUser);

  return {
    user,
    setUser,
  };
}
