import axios from "../../lib/axios";
import {
  unwrapApiResponse,
  type ApiResponse,
} from "../../types/Api";

export interface CreateProjectRequest {
  name: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  dueDate: string;
  teamMembers: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  teamMembers: string[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface ProjectPagePayload {
  items?: Project[];
  projects?: Project[];
  results?: Project[];
  totalCount?: number;
  totalItems?: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;
  pagination?: {
    totalCount?: number;
    totalItems?: number;
    totalPages?: number;
    page?: number;
    pageSize?: number;
    currentPage?: number;
    pageNumber?: number;
  };
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (
  value: unknown,
): UnknownRecord | undefined =>
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
    const found = findProjectItems(
      record[key],
      depth + 1,
    );
    if (found) {
      return found;
    }
  }

  return undefined;
};

const firstNumber = (
  ...values: unknown[]
): number | undefined =>
  values.find(
    (value): value is number =>
      typeof value === "number" &&
      Number.isFinite(value),
  );

export const getProjects = async (
  params: GetProjectsParams = {},
): Promise<ProjectPage> => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  const response = await axios.get<unknown>("/projects", {
    params: {
      page,
      pageSize,
      ...(params.search?.trim()
        ? {
            search: params.search.trim(),
          }
        : {}),
      ...(params.status
        ? {
            status: params.status,
          }
        : {}),
    },
  });

  const envelope = asRecord(response.data);
  const payload = unwrapApiResponse<unknown>(
    response.data,
  );
  const payloadRecord = asRecord(payload);
  const envelopeMeta = asRecord(envelope?.meta);
  const payloadMeta = asRecord(payloadRecord?.meta);
  const pagination = asRecord(
    payloadRecord?.pagination ??
      envelopeMeta?.pagination ??
      payloadMeta?.pagination,
  );
  const items = findProjectItems(payload) ?? [];

  const totalCount = firstNumber(
    payloadRecord?.totalCount,
    payloadRecord?.totalItems,
    payloadRecord?.totalRecords,
    pagination?.totalCount,
    pagination?.totalItems,
    pagination?.totalRecords,
    envelopeMeta?.totalCount,
    envelopeMeta?.totalItems,
    items.length,
  ) ?? items.length;

  const totalPages = firstNumber(
    payloadRecord?.totalPages,
    pagination?.totalPages,
    envelopeMeta?.totalPages,
  );

  const responsePage = firstNumber(
    payloadRecord?.page,
    payloadRecord?.currentPage,
    pagination?.page,
    pagination?.currentPage,
    pagination?.pageNumber,
    envelopeMeta?.page,
    envelopeMeta?.currentPage,
  );

  const responsePageSize = firstNumber(
    payloadRecord?.pageSize,
    pagination?.pageSize,
    envelopeMeta?.pageSize,
  );

  return {
    items,
    totalCount,
    totalPages:
      totalPages ??
      Math.ceil(totalCount / pageSize),
    page: responsePage ?? page,
    pageSize: responsePageSize ?? pageSize,
  };
};

export const createProject = async (
  data: CreateProjectRequest,
): Promise<Project> => {
  try {
    console.log(
      "CREATE PROJECT REQUEST:",
      data,
    );

    const response = await axios.post<
      ApiResponse<Project>
    >("/projects", data);

    console.log(
      "CREATE PROJECT RESPONSE:",
      response.data,
    );

    return unwrapApiResponse(
      response.data,
    );
  } catch (error: any) {
    console.error(
      "CREATE PROJECT ERROR:",
      error.response?.data ?? error,
    );

    const backendError =
      error.response?.data;

    if (backendError?.message) {
      throw new Error(
        backendError.message,
      );
    }

    throw error;
  }
};

export const updateProject = async (
  id: string,
  data: CreateProjectRequest,
): Promise<Project> => {
  const response = await axios.put<
    ApiResponse<Project>
  >(`/projects/${id}`, data);

  return unwrapApiResponse(
    response.data,
  );
};

export const deleteProject = async (
  id: string,
): Promise<void> => {
  await axios.delete(`/projects/${id}`);
};