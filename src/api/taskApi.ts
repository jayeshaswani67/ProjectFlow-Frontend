import api from "../lib/axios";
import type { ApiResponse } from "../types/Api";
import type {
  EmployeeTask,
  Task,
  TaskSummary,
  UpdateTaskStatusRequest,
} from "../types/task.types";

export type {
  TaskSummary,
} from "../types/task.types";

export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate: string;
}

export interface UpdateTaskRequest {
  projectId?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
}

/**
 * GET /api/tasks
 *
 * Get all tasks.
 */
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<ApiResponse<Task[]>>(
    "/tasks",
  );

  return response.data.data ?? [];
};

export const getTasks = async (): Promise<TaskItem[]> => {
  const response = await api.get<ApiResponse<TaskItem[]>>("/tasks");

  return response.data.data ?? [];
};

/**
 * GET /api/tasks/my
 *
 * Get tasks assigned to the currently
 * authenticated employee/user.
 */
export const getMyTasks = async (): Promise<EmployeeTask[]> => {
  const response = await api.get<ApiResponse<EmployeeTask[]>>(
    "/tasks/my",
  );

  return response.data.data ?? [];
};

/**
 * GET /api/tasks/summary
 *
 * Get task summary/statistics.
 */
export const getTaskSummary = async (): Promise<TaskSummary> => {
  const response = await api.get<ApiResponse<TaskSummary>>(
    "/tasks/summary",
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Failed to load task summary.",
    );
  }

  return response.data.data;
};

/**
 * POST /api/projects/{projectId}/tasks
 *
 * Create a task in a project.
 */
export const createTask = async (
  projectId: string,
  request: CreateTaskRequest,
): Promise<TaskItem> => {
  const response = await api.post<ApiResponse<TaskItem>>(
    `/projects/${projectId}/tasks`,
    request,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Failed to create task.",
    );
  }

  return response.data.data;
};

/**
 * PUT /api/tasks/{id}
 *
 * Update an existing task.
 */
export const updateTask = async (
  id: string,
  request: UpdateTaskRequest,
): Promise<TaskItem> => {
  const response = await api.put<ApiResponse<TaskItem>>(
    `/tasks/${id}`,
    request,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Failed to update task.",
    );
  }

  return response.data.data;
};

/**
 * DELETE /api/tasks/{id}
 *
 * Delete a task.
 */
export const deleteTask = async (
  id: string,
): Promise<void> => {
  await api.delete<ApiResponse<unknown>>(
    `/tasks/${id}`,
  );
};

/**
 * PATCH /api/tasks/{id}/status
 *
 * Update only the task status.
 */
export const updateTaskStatus = async (
  id: string,
  request: string | UpdateTaskStatusRequest,
): Promise<TaskItem> => {
  const status =
    typeof request === "string" ? request : request.status;
  const response = await api.patch<ApiResponse<TaskItem>>(
    `/tasks/${id}/status`,
    { status },
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Failed to update task status.",
    );
  }

  return response.data.data;
};