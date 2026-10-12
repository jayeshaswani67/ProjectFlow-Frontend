import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getSettings,
  updateSettings,
  type UpdateSettingsRequest,
} from "../api/settingsApi";

export default function useAdminSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (
      data: UpdateSettingsRequest
    ) => updateSettings(data),

    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(
        ["admin", "settings"],
        updatedSettings
      );
    },
  });

  return {
    settings: settingsQuery.data,

    isLoading: settingsQuery.isLoading,

    isError: settingsQuery.isError,

    error: settingsQuery.error,

    updateSettings: updateMutation.mutateAsync,

    isUpdating: updateMutation.isPending,
  };
}