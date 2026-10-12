import { z } from "zod";

export const permissionsSchema = z.object({
  viewDashboard: z.boolean(),

  viewProjects: z.boolean(),
  createProject: z.boolean(),
  editProject: z.boolean(),
  deleteProject: z.boolean(),

  viewTasks: z.boolean(),
  createTask: z.boolean(),
  editTask: z.boolean(),
  deleteTask: z.boolean(),
  assignTask: z.boolean(),

  viewTeam: z.boolean(),
  manageTeam: z.boolean(),

  viewAnalytics: z.boolean(),

  useAIPlanner: z.boolean(),

  manageUsers: z.boolean(),
  manageRoles: z.boolean(),

  systemSettings: z.boolean(),
});

export type PermissionsFormData =
  z.infer<typeof permissionsSchema>;