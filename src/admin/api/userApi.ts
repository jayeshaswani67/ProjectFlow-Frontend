import type { ApiResponse } from "../../types/Api";
import api from "../../lib/axios.ts";

export type Role = "Manager" | "Employee";

export type JobRole =
  | "Developer"
  | "Designer"
  | "Marketer"
  | "Video Editor";

export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Employee";
  jobRole: JobRole;
  department: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  jobRole: JobRole;
  department: string;
  status: UserStatus;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: "Manager" | "Employee";
  jobRole: JobRole;
  department: string;
  status: UserStatus;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>("/users");
  return response.data.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (
  data: CreateUserRequest
): Promise<User> => {
  const response = await api.post<ApiResponse<User>>("/users", data);
  return response.data.data;
};

export const updateUser = async (
  id: string,
  data: UpdateUserRequest
): Promise<User> => {
  const response = await api.put<ApiResponse<User>>(
    `/users/${id}`,
    data
  );

  return response.data.data;
};

export const updateUserStatus = async (
  id: string,
  status: UserStatus
) => {
  const response = await api.patch<ApiResponse<User>>(
    `/users/${id}/status`,
    { status }
  );

  return response.data.data;
};

export const deleteUser = async (
  id: string
): Promise<void> => {
  await api.delete<ApiResponse<User>>(`/users/${id}`);
};