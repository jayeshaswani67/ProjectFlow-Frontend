import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserStatus,
  type CreateUserRequest,
  type UpdateUserRequest,
  type User,
  type UserStatus,
} from "../api/userApi";

interface UpdateUserVariables {
  id: string;
  data: UpdateUserRequest;
}

interface UpdateStatusVariables {
  id: string;
  status: UserStatus;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) =>
      createUser(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: UpdateUserVariables) =>
      updateUser(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: UpdateStatusVariables) =>
      updateUserStatus(id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteUser(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });

  return {
    users: usersQuery.data ?? [],

    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,

    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    updateUserStatus: statusMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: statusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}