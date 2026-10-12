import api from "../lib/axios";
import type { ApiResponse } from "../types/Api";

import type {
  EmployeeProject,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../types/project.types";

import type {
  Task,
  CreateTaskRequest,
} from "../types/task.types";

export interface GetProjectsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface ProjectPage {
  items: Project[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../types/project.types";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | undefined =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;

const findProjectItems = (
  value: unknown,
  depth = 0,
): Project[] | undefined => {
  if (Array.isArray(value)) {
    return value as Project[];
  }

  if (depth >= 3) {
    return undefined;
  }

  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  for (const key of [
    "items",
    "projects",
    "results",
    "records",
    "data",
    "result",
  ]) {
    const found = findProjectItems(record[key], depth + 1);
    if (found) {
      return found;
    }
  }

  return undefined;
};

const firstNumber = (...values: unknown[]): number | undefined =>
  values.find(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );

/**
 * GET /api/projects
 *
 * Get a page of projects, optionally filtered by search/status.
 */
export const getProjects = async (
  params: GetProjectsParams = {},
): Promise<ProjectPage> => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const response = await api.get<unknown>("/projects", {
    params: {
      page,
      pageSize,
      ...(params.search?.trim()
        ? { search: params.search.trim() }
        : {}),
      ...(params.status ? { status: params.status } : {}),
    },
  });

  const envelope = asRecord(response.data);
  const payload = asRecord(envelope)?.data ?? response.data;
  const payloadRecord = asRecord(payload);
  const envelopeMeta = asRecord(envelope?.meta);
  const pagination = asRecord(
    payloadRecord?.pagination ?? envelopeMeta?.pagination,
  );
  const items = findProjectItems(payload) ?? [];

  const totalCount =
    firstNumber(
      payloadRecord?.totalCount,
      payloadRecord?.totalItems,
      payloadRecord?.totalRecords,
      pagination?.totalCount,
      pagination?.totalItems,
      pagination?.totalRecords,
      envelopeMeta?.totalCount,
      envelopeMeta?.totalItems,
    ) ?? items.length;
  const totalPages =
    firstNumber(
      payloadRecord?.totalPages,
      pagination?.totalPages,
      envelopeMeta?.totalPages,
    ) ?? Math.ceil(totalCount / pageSize);

  return {
    items,
    totalCount,
    totalPages,
    page:
      firstNumber(
        payloadRecord?.page,
        payloadRecord?.currentPage,
        pagination?.page,
        pagination?.currentPage,
        pagination?.pageNumber,
        envelopeMeta?.page,
        envelopeMeta?.currentPage,
      ) ?? page,
    pageSize:
      firstNumber(
        payloadRecord?.pageSize,
        pagination?.pageSize,
        envelopeMeta?.pageSize,
      ) ?? pageSize,
  };
};

/**
 * GET /api/projects
 *
 * Get all projects.
 */
export const getAllProjects = async (): Promise<Project[]> => {
  const response = await api.get<ApiResponse<Project[]>>("/projects");

  return response.data.data ?? [];
};

/**
 * POST /api/projects
 *
 * Create a new project.
 */
export const createProject = async (
  request: CreateProjectRequest,
): Promise<Project> => {
  const response = await api.post<ApiResponse<Project>>(
    "/projects",
    request,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Failed to create project.",
    );
  }

  return response.data.data;
};

/**
 * GET /api/projects/my
 *
 * Get projects assigned to / managed by
 * the currently authenticated user.
 */
export const getMyProjects = async (): Promise<EmployeeProject[]> => {
  const response = await api.get<ApiResponse<EmployeeProject[]>>(
    "/projects/my",
  );

  return response.data.data ?? [];
};

/**
 * GET /api/projects/{id}
 *
 * Get a single project by ID.
 */
export const getProject = async (
  id: string,
): Promise<Project> => {
  const response = await api.get<ApiResponse<Project>>(
    `/projects/${id}`,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Project not found.",
    );
  }

  return response.data.data;
};

/**
 * PUT /api/projects/{id}
 *
 * Update an existing project.
 */
export const updateProject = async (
  id: string,
  request: UpdateProjectRequest,
): Promise<Project> => {
  const response = await api.put<ApiResponse<Project>>(
    `/projects/${id}`,
    request,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Failed to update project.",
    );
  }

  return response.data.data;
};

/**
 * DELETE /api/projects/{id}
 *
 * Delete a project.
 */
export const deleteProject = async (
  id: string,
): Promise<void> => {
  await api.delete<ApiResponse<unknown>>(
    `/projects/${id}`,
  );
};

/**
 * POST /api/projects/{projectId}/tasks
 *
 * Create a task inside a specific project.
 */
export const createProjectTask = async (
  projectId: string,
  request: CreateTaskRequest,
): Promise<Task> => {
  const response = await api.post<ApiResponse<Task>>(
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