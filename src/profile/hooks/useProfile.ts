import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMyProfile,
  updateMyProfile,
} from "../api/profileApi";

import type {
  UpdateProfileRequest,
} from "../types/profile.types";

export const profileQueryKey = ["profile", "me"] as const;

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: getMyProfile,
    staleTime: 60_000,
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) =>
      updateMyProfile(request),

    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile);
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}