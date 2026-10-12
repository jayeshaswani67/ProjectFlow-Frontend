import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types/Api";
import { ApiRequestError } from "./ApiError";
import {
  AUTH_COOKIE_NAMES,
  deleteCookie,
  getCookie,
  setCookie,
} from "../utils/cookies";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/*  TYPES */
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn: number;
}

let refreshPromise: Promise<string | null> | null = null;

/*  AUTH STORAGE  */
const clearAuth = () => {
  deleteCookie(AUTH_COOKIE_NAMES.accessToken);
  deleteCookie(AUTH_COOKIE_NAMES.refreshToken);
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
};

/* API ERROR */
const getApiError = (error: AxiosError): ApiRequestError => {
  const response = error.response?.data as ApiResponse | undefined;

  return new ApiRequestError(
    error.response?.status ?? 0,
    response ?? {
      success: false,
      message: error.message || "Something went wrong.",
      code: error.code || "API_ERROR",
      errors: [],
    },
  );
};

/*  AUTH ENDPOINT CHECK */
const isAuthEndpoint = (url: string): boolean => {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password")
  );
};

/* REFRESH ACCESS TOKEN */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getCookie(AUTH_COOKIE_NAMES.refreshToken);

  const response = await refreshClient.post<ApiResponse<RefreshResponse>>(
    "/auth/refresh",
    refreshToken ? { refreshToken } : {},
  );

  const data = response.data.data;

  if (data?.accessToken) {
    setCookie(AUTH_COOKIE_NAMES.accessToken, data.accessToken);
  }
  if (data?.refreshToken) {
    setCookie(AUTH_COOKIE_NAMES.refreshToken, data.refreshToken);
  }

  return data?.accessToken ?? getCookie(AUTH_COOKIE_NAMES.accessToken);
};

/* REQUEST INTERCEPTOR */
api.interceptors.request.use(
  (config) => {
    const token = getCookie(AUTH_COOKIE_NAMES.accessToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(getApiError(error));
  },
);

/* RESPONSE INTERCEPTOR */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const request = error.config as RetryConfig | undefined;

    if (!request) {
      return Promise.reject(getApiError(error));
    }

    const status = error.response?.status;
    const url = request.url ?? "";

    if (isAuthEndpoint(url)) {
      return Promise.reject(getApiError(error));
    }

    if (status !== 401) {
      return Promise.reject(getApiError(error));
    }

    if (request._retry) {
      return Promise.reject(getApiError(error));
    }

    request._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        request.headers.Authorization = `Bearer ${newAccessToken}`;
      } else {
        delete request.headers.Authorization;
      }

      return api(request);
    } catch (refreshError) {
      clearAuth();

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(
        refreshError instanceof ApiRequestError
          ? refreshError
          : getApiError(refreshError as AxiosError),
      );
    }
  },
);

export default api;
