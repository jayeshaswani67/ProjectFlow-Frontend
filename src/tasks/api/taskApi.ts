import api from "../../lib/axios.ts";
import {
  unwrapApiResponse,
  type ApiResponse,
} from "../../types/Api";

/* =========================================================
   TASK TYPES
========================================================= */

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

/* =========================================================
   CREATE TASK REQUEST
========================================================= */

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate: string;
}

/* =========================================================
   UPDATE TASK REQUEST
========================================================= */

export interface UpdateTaskRequest {
  projectId?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
}

/* =========================================================
   TASK SUMMARY
========================================================= */

export interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  today: number;
  overdue: number;
}

/* =========================================================
   GET TASKS FOR PROJECT
========================================================= */

export const getTasks = async (
): Promise<TaskItem[]> => {
  const response = await api.get<
    TaskItem[] | ApiResponse<TaskItem[]>
  >(
    "/tasks"
  );

  return unwrapApiResponse(response.data);
};


export const getProjectTasks = async (
  projectId: string
): Promise<TaskItem[]> => {
  const response = await api.get<
    TaskItem[] | ApiResponse<TaskItem[]>
  >(
    `/tasks/project/${projectId}`
  );

  return unwrapApiResponse(response.data);
};

/* =========================================================
   GET TASK SUMMARY
========================================================= */

export const getTaskSummary = async (): Promise<TaskSummary> => {
  const response = await api.get<
    TaskSummary | ApiResponse<TaskSummary>
  >(
    "/tasks/summary"
  );

  return unwrapApiResponse(response.data);
};

/* =========================================================
   CREATE TASK
========================================================= */

export const createTask = async (
  projectId: string,
  task: CreateTaskRequest
): Promise<TaskItem> => {
  const response = await api.post<
    TaskItem | ApiResponse<TaskItem>
  >(
    `/projects/${projectId}/tasks`,
    task
  );

  return unwrapApiResponse(response.data);
};

/* =========================================================
   UPDATE TASK
========================================================= */

export const updateTask = async (
  id: string,
  task: UpdateTaskRequest
): Promise<TaskItem> => {
  const response = await api.put<
    TaskItem | ApiResponse<TaskItem>
  >(
    `/tasks/${id}`,
    task
  );

  return unwrapApiResponse(response.data);
};

/* =========================================================
   UPDATE TASK STATUS
========================================================= */

export const updateTaskStatus = async (
  id: string,
  status: string
): Promise<TaskItem> => {
  const response = await api.patch<
    TaskItem | ApiResponse<TaskItem>
  >(
    `/tasks/${id}/status`,
    {
      status,
    }
  );

  return unwrapApiResponse(response.data);
};

/* =========================================================
   DELETE TASK
========================================================= */

export const deleteTask = async (
  id: string
): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};