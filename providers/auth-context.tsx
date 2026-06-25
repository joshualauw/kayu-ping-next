"use client";

import { createContext, useContext } from "react";
import { LoggedUser } from "@/types/logged-user";
import { useAuthState } from "@/providers/use-auth-state";

export type AuthContextValue = LoggedUser;

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  user: LoggedUser;
}

export function AuthProvider({ children, user }: AuthProviderProps) {
  const value = useAuthState({ user });
  return <AuthContext.Provider value={value.user}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
