import {
  can as hasPermission,
  getCurrentRole,
} from "../services/auth/permissionService";
import { AUTH_COOKIE_NAMES, deleteCookie } from "./cookies";

export const PERMISSIONS = {
  VIEW_DASHBOARD: "viewDashboard",

  VIEW_PROJECTS: "viewProjects",
  CREATE_PROJECT: "createProject",
  EDIT_PROJECT: "editProject",
  DELETE_PROJECT: "deleteProject",

  VIEW_TASKS: "viewTasks",
  CREATE_TASK: "createTask",
  EDIT_TASK: "editTask",
  DELETE_TASK: "deleteTask",
  ASSIGN_TASK: "assignTask",

  VIEW_TEAM: "viewTeam",
  MANAGE_TEAM: "manageTeam",

  VIEW_ANALYTICS: "viewAnalytics",

  USE_AI_PLANNER: "useAIPlanner",

  MANAGE_USERS: "manageUsers",
  MANAGE_ROLES: "manageRoles",
  SYSTEM_SETTINGS: "systemSettings",

  SUBMIT_WORK: "submitWork",
  REVIEW_WORK: "reviewWork",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type UserRole =
  | "Admin"
  | "Manager"
  | "Developer"
  | "Employee";

const roleByClaim: Record<string, UserRole> = {
  admin: "Admin",
  manager: "Manager",
  developer: "Developer",
  employee: "Employee",
};

export function getUserRole(): UserRole | null {
  const role = getCurrentRole();
  return role ? roleByClaim[role.toLowerCase()] ?? null : null;
}

export function isAdmin(): boolean {
  return getUserRole() === "Admin";
}

export function can(permission: Permission | string): boolean {
  return hasPermission(permission);
}

export function clearAuth(): void {
  deleteCookie(AUTH_COOKIE_NAMES.accessToken);
  deleteCookie(AUTH_COOKIE_NAMES.refreshToken);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
}