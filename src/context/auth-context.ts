import { createContext } from "react";
import type { User } from "../auth/api/authApi";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (user: User) => void;
  updateUserName: (name: string) => void;
  logoutUser: () => void;
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);
