import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../auth/api/authApi";
import { clearAuth } from "../utils/permission";
import { AuthContext } from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      try {
        return JSON.parse(storedUser) as User;
      } catch {
        clearAuth();
        return null;
      }
    });

  const loginUser = useCallback((user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userRole", user.role);
    setUser(user);
  }, []);

  const updateUserName = useCallback((name: string) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = { ...currentUser, name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    clearAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(
        user,
      ),
      loginUser,
      updateUserName,
      logoutUser,
    }),
    [user, loginUser, updateUserName, logoutUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}