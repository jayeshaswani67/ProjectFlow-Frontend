
import type { UserRole } from "../api/authApi";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const getCurrentUser =
  (): CurrentUser | null => {
    const user =
      localStorage.getItem("user");

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  };

export const getUserRole =
  (): UserRole | null => {
    return getCurrentUser()?.role ?? null;
  };

export const isManager = (): boolean => {
  return getUserRole() === "Manager";
};

export const isDeveloper = (): boolean => {
  const role = getUserRole();
  return role === "Developer" || role === "Employee";
};

