export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  code?: string;
  data?: T;
  errors?: ApiErrorDetail[];
}

export const unwrapApiResponse = <T>(
  response: T | ApiResponse<T>,
): T => {
  if (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "message" in response
  ) {
    const apiResponse = response as ApiResponse<T>;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "API request failed.");
    }

    if (apiResponse.data === undefined) {
      throw new Error("API response did not include data.");
    }

    return apiResponse.data;
  }

  return response as T;
};