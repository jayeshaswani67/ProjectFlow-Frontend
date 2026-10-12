import api from "../lib/axios";
import { unwrapApiResponse, type ApiResponse } from "../types/Api";
import type { DashboardResponse } from "../types/dashboard.types";

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get<
    DashboardResponse | ApiResponse<DashboardResponse>
  >("/dashboard");

  return unwrapApiResponse(response.data);
};