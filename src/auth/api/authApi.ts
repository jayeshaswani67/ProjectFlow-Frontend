import api from "../../lib/axios";

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
  accessToken?: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
}

type ResponseRecord = Record<string, unknown>;

const isResponseRecord = (value: unknown): value is ResponseRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getResponseField = (
  record: ResponseRecord,
  name: string,
): unknown => {
  const normalizedName = name.replaceAll("_", "").toLowerCase();
  const key = Object.keys(record).find(
    (field) => field.replaceAll("_", "").toLowerCase() === normalizedName,
  );

  return key ? record[key] : undefined;
};

const normalizeLoginResponse = (responseBody: unknown): LoginResponse => {
  let payload = responseBody;

  for (let depth = 0; depth < 5 && isResponseRecord(payload); depth += 1) {
    const accessToken = getResponseField(payload, "accessToken");
    const refreshToken = getResponseField(payload, "refreshToken");
    const user = getResponseField(payload, "user");

    if (isResponseRecord(user)) {
      const expiresIn = getResponseField(payload, "expiresIn");

      return {
        accessToken: typeof accessToken === "string" ? accessToken : undefined,
        refreshToken:
          typeof refreshToken === "string" ? refreshToken : undefined,
        expiresIn: typeof expiresIn === "number" ? expiresIn : 0,
        user: user as unknown as User,
      };
    }

    const success = getResponseField(payload, "success");
    const message = getResponseField(payload, "message");

    if (success === false) {
      throw new Error(
        typeof message === "string" ? message : "Login request was rejected.",
      );
    }

    const nestedData = getResponseField(payload, "data");
    if (!isResponseRecord(nestedData)) {
      break;
    }

    payload = nestedData;
  }

  const availableFields = isResponseRecord(payload)
    ? Object.keys(payload).join(", ")
    : "none";
  throw new Error(
    `Login response is missing user information. Received fields: ${availableFields}.`,
  );
};

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
  const response = await api.post<unknown>(
    "/auth/login",
    {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    }
  );

  return normalizeLoginResponse(response.data);
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