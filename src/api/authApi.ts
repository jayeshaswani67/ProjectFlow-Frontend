import api from "../lib/axios";

export type UserRole =
  | "Admin"
  | "Manager"
  | "Developer"
  | "Employee";

export interface UserPermissions {
  viewDashboard: boolean;

  viewProjects: boolean;
  createProject: boolean;
  editProject: boolean;
  deleteProject: boolean;

  viewTasks: boolean;
  createTask: boolean;
  editTask: boolean;
  deleteTask: boolean;
  assignTask: boolean;

  viewTeam: boolean;
  manageTeam: boolean;

  viewAnalytics: boolean;

  useAIPlanner: boolean;

  manageUsers: boolean;
  manageRoles: boolean;

  systemSettings: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}
export interface ForgetPasswordRequest {
  message: string;
  email: string;
}
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ResetPasswordResponse {
  message: string;
}

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    }
  );

  return response.data;
};


export const getMe = async (): Promise<User> => {
  const response = await api.get<User>(
    "/auth/me"
  );

  return response.data;
};

export const refreshToken = async (
  refreshTokenValue: string
): Promise<RefreshTokenResponse> => {
  if (!refreshTokenValue) {
    throw new Error("Refresh token is missing.");
  }

  const response =
    await api.post<RefreshTokenResponse>(
      "/auth/refresh",
      {
        refreshToken: refreshTokenValue,
      }
    );

  return response.data;
};

export const forgetPassword = async (
  email: string
): Promise<ForgetPasswordRequest> => {
  const response = await api.post<ForgetPasswordRequest>(
    "/auth/forgot-password",
    {
      email,
    }
  );
  return response.data;
};

//reset password 
export const resetPassword = async (
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>(
    "/auth/reset-password",
    payload
  );
  return response.data;
};


export const logout = async (
  refreshTokenValue?: string
): Promise<void> => {
  await api.post("/auth/logout", {
    refreshToken: refreshTokenValue ?? "",
  });
};