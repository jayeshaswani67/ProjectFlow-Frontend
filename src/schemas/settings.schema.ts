import { z } from "zod";
import { apiResponseSchema } from "../schemas/api.Schema";

export const settingsSchema = z.object({
  id: z.string().optional(),

  applicationName: z.string(),

  companyName: z.string(),

  timezone: z.string(),

  defaultProjectStatus: z.string(),

  defaultTaskPriority: z.string(),

  allowEmployeeCreateProjects:
    z.boolean(),

  allowEmployeeCreateTasks:
    z.boolean(),

  requireTaskAssignment:
    z.boolean(),

  emailNotifications:
    z.boolean(),

  taskNotifications:
    z.boolean(),

  projectNotifications:
    z.boolean(),

  updatedAt: z
    .string()
    .optional()
    .nullable(),
});

export const settingsResponseSchema =
  apiResponseSchema(settingsSchema);

export type Settings = z.infer<
  typeof settingsSchema
>;