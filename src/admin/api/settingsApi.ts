import axios from "../../lib/axios.ts";

import {
  settingsResponseSchema,
  settingsSchema,
  type Settings,
} from "../../schemas/settings.schema";

export interface UpdateSettingsRequest {
  applicationName: string;
  companyName: string;
  timezone: string;
  defaultProjectStatus: string;
  defaultTaskPriority: string;
  allowEmployeeCreateProjects: boolean;
  allowEmployeeCreateTasks: boolean;
  requireTaskAssignment: boolean;
  emailNotifications: boolean;
  taskNotifications: boolean;
  projectNotifications: boolean;
}

export const getSettings =
  async (): Promise<Settings> => {
    const response = await axios.get(
      "/settings",
    );

    console.log(
      "SETTINGS RAW RESPONSE:",
      response.data,
    );

    const result =
      settingsResponseSchema.safeParse(
        response.data,
      );

    if (!result.success) {
      console.error(
        "SETTINGS ZOD VALIDATION FAILED",
      );

      console.error(
        "ZOD ERRORS:",
        result.error.format(),
      );

      console.error(
        "ACTUAL RESPONSE:",
        response.data,
      );

      throw new Error(
        "Invalid settings response from server.",
      );
    }

    return result.data.data;
  };

export const updateSettings =
  async (
    data: UpdateSettingsRequest,
  ): Promise<Settings> => {
    const response = await axios.put(
      "/settings",
      data,
    );

    console.log(
      "UPDATE SETTINGS RESPONSE:",
      response.data,
    );

    const result =
      settingsResponseSchema.safeParse(
        response.data,
      );

    if (!result.success) {
      console.error(
        "UPDATE SETTINGS ZOD VALIDATION FAILED:",
        result.error.format(),
      );

      throw new Error(
        "Invalid settings response from server.",
      );
    }

    return result.data.data;
  };