import api from "../../lib/axios";
import type { ApiResponse } from "../../types/Api";
import type {
  UserProfile,
  UpdateProfileRequest,
} from "../types/profile.types";

export async function getMyProfile(): Promise<UserProfile> {
  const response = await api.get<ApiResponse<UserProfile>>(
    "/profile/me",
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Unable to load your profile.",
    );
  }

  return response.data.data;
}

export async function updateMyProfile(
  request: UpdateProfileRequest,
): Promise<UserProfile> {
  const response = await api.put<ApiResponse<UserProfile>>(
    "/profile/me",
    request,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Unable to update your profile.",
    );
  }

  return response.data.data;
}