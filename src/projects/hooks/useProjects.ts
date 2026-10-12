import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type CreateProjectRequest,
  type GetProjectsParams,
} from "../api/projectApi";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export const useProjects = (
  params: GetProjectsParams = {},
) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize =
    params.pageSize ?? DEFAULT_PAGE_SIZE;

  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";

  return useQuery({
    queryKey: [
      "projects",
      page,
      pageSize,
      search,
      status,
    ],

    queryFn: () =>
      getProjects({
        page,
        pageSize,
        search,
        status,
      }),

    placeholderData: (previousData) =>
      previousData,

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateProjectRequest,
    ) => createProject(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateProjectRequest;
    }) =>
      updateProject(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteProject(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};