import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMySubmissions,
  submitWork,
  type CreateWorkSubmissionRequest,
} from "../api/workSubmissionApi";

export const workSubmissionKeys = {
  all: ["work-submissions"] as const,

  mine: () =>
    [...workSubmissionKeys.all, "mine"] as const,
};

export function useMyWorkSubmissions() {
  return useQuery({
    queryKey: workSubmissionKeys.mine(),
    queryFn: getMySubmissions,
  });
}

export function useSubmitWork() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateWorkSubmissionRequest,
    ) => submitWork(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          workSubmissionKeys.mine(),
      });
    },
  });
}