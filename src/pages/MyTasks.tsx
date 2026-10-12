import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Search,
  CalendarDays,
  AlertCircle,
  Clock3,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

import {
  getMyTasks,
  updateTaskStatus,
} from "../api/taskApi";
import { useDebounce } from "../hooks/useDebounce";

import type {
  EmployeeTask,
  TaskStatus,
  UpdateTaskStatusRequest,
} from "../types/task.types";

type TaskFilter =
  | "All"
  | TaskStatus
  | "Overdue";

export default function MyTasks() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] =
    useState("");

  const debouncedSearch =
    useDebounce(searchInput, 300);

  const [filter, setFilter] =
    useState<TaskFilter>("All");

  const [isPending, startTransition] =
    useTransition();

  const isSearchPending =
    searchInput !== debouncedSearch;

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<EmployeeTask[]>({
    queryKey: ["tasks", "my"],
    queryFn: getMyTasks,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateTaskStatusRequest;
    }) =>
      updateTaskStatus(id, request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", "my"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });

  const filteredTasks = useMemo(() => {
    const query =
      debouncedSearch.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title
          .toLowerCase()
          .includes(query) ||
        task.description
          ?.toLowerCase()
          .includes(query) ||
        task.projectName
          ?.toLowerCase()
          .includes(query);

      const overdue =
        isTaskOverdue(task);

      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Overdue"
            ? overdue
            : task.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [tasks, debouncedSearch, filter]);

  const pendingCount =
    tasks.filter(
      (task) => task.status === "Todo",
    ).length;

  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status === "InProgress",
    ).length;

  const submittedCount =
    tasks.filter(
      (task) =>
        task.status === "Submitted",
    ).length;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status === "Completed",
    ).length;

  const overdueCount =
    tasks.filter(isTaskOverdue).length;

  const handleStatusChange = (
    task: EmployeeTask,
    status: TaskStatus,
  ) => {
    if (status === task.status) {
      return;
    }

    statusMutation.mutate({
      id: task.id,
      request: {
        status,
      },
    });
  };

  const getStatusClass = (
    status: TaskStatus,
  ) => {
    switch (status) {
      case "Todo":
        return "bg-slate-100 text-slate-700";

      case "InProgress":
        return "bg-blue-50 text-blue-700";

      case "Submitted":
        return "bg-purple-50 text-purple-700";

      case "ChangesRequested":
        return "bg-amber-50 text-amber-700";

      case "Completed":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatStatus = (
    status: TaskStatus,
  ) => {
    if (status === "InProgress") {
      return "In Progress";
    }

    if (status === "ChangesRequested") {
      return "Changes Requested";
    }

    return status;
  };

  const formatDate = (
    date?: string | null,
  ) => {
    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <CheckSquare size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Tasks
            </h1>

            <p className="text-sm text-slate-500">
              Tasks assigned to you
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              isFetching
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

        <TaskStat
          title="Pending"
          value={pendingCount}
          icon={<Clock3 size={18} />}
        />

        <TaskStat
          title="In Progress"
          value={inProgressCount}
          icon={<Loader2 size={18} />}
        />

        <TaskStat
          title="Submitted"
          value={submittedCount}
          icon={<CheckSquare size={18} />}
        />

        <TaskStat
          title="Completed"
          value={completedCount}
          icon={<CheckCircle2 size={18} />}
        />

        <TaskStat
          title="Overdue"
          value={overdueCount}
          icon={<AlertCircle size={18} />}
          danger={overdueCount > 0}
        />

      </div>

      {/* SEARCH + FILTER */}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Search my tasks..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />

        </div>

        <div className="flex flex-wrap gap-2">

          {[
            ["All", "All"],
            ["Todo", "Pending"],
            ["InProgress", "In Progress"],
            ["Submitted", "Submitted"],
            ["ChangesRequested", "Changes Requested"],
            ["Completed", "Completed"],
            ["Overdue", "Overdue"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                startTransition(() =>
                  setFilter(value as TaskFilter),
                )
              }
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                filter === value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}

        </div>

      </div>

      {/* ERROR */}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={20}
              className="mt-0.5 text-red-600"
            />

            <div>

              <h3 className="font-semibold text-red-800">
                Unable to load tasks
              </h3>

              <p className="mt-1 text-sm text-red-700">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                Try again
              </button>

            </div>

          </div>

        </div>
      )}

      {/* TASK LIST */}

      <div
        aria-busy={isPending || isSearchPending}
        className={`overflow-hidden rounded-2xl border border-slate-200 bg-white transition-opacity ${
          isPending || isSearchPending
            ? "opacity-60"
            : ""
        }`}
      >

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm text-slate-500">

              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading your tasks...

            </div>

          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <CheckSquare
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No tasks found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {searchInput
                ? "Try changing your search or filter."
                : "No tasks have been assigned to you yet."}
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {filteredTasks.map(
              (task) => {
                const overdue =
                  isTaskOverdue(task);

                return (
                  <div
                    key={task.id}
                    className="p-5 transition hover:bg-slate-50"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      {/* TASK INFORMATION */}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="text-base font-semibold text-slate-900">
                            {task.title}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                              task.status,
                            )}`}
                          >
                            {formatStatus(
                              task.status,
                            )}
                          </span>

                          {overdue && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                              Overdue
                            </span>
                          )}

                        </div>

                        {task.description && (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">

                          {task.projectName && (
                            <span>
                              Project:{" "}
                              <strong className="text-slate-700">
                                {task.projectName}
                              </strong>
                            </span>
                          )}

                          <span>
                            Priority:{" "}
                            <strong className="text-slate-700">
                              {task.priority}
                            </strong>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} />

                            {formatDate(
                              task.dueDate,
                            )}
                          </span>

                        </div>

                        {task.managerFeedback && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">

                            <p className="text-xs font-semibold text-amber-800">
                              Manager feedback
                            </p>

                            <p className="mt-1 text-sm text-amber-700">
                              {task.managerFeedback}
                            </p>

                          </div>
                        )}

                      </div>

                      {/* STATUS SELECT */}

                      <div className="w-full shrink-0 lg:w-48">

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Update status
                        </label>

                        <div className="relative">

                          <select
                            value={task.status}
                            disabled={
                              statusMutation.isPending
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                task,
                                event.target
                                  .value as TaskStatus,
                              )
                            }
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:opacity-50"
                          >
                            <option value="Todo">
                              Pending
                            </option>

                            <option value="InProgress">
                              In Progress
                            </option>

                            <option value="Submitted">
                              Submitted
                            </option>

                            <option value="ChangesRequested">
                              Changes Requested
                            </option>

                            <option value="Completed">
                              Completed
                            </option>
                          </select>

                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                        </div>

                        {statusMutation.isPending && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                            Updating...
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                );
              },
            )}

          </div>
        )}

      </div>

    </div>
  );
}


/* ================================
   HELPERS
================================ */

function isTaskOverdue(
  task: EmployeeTask,
) {
  if (!task.dueDate) {
    return false;
  }

  if (task.status === "Completed") {
    return false;
  }

  return (
    new Date(task.dueDate) <
    new Date()
  );
}


/* ================================
   STAT CARD
================================ */

interface TaskStatProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  danger?: boolean;
}

function TaskStat({
  title,
  value,
  icon,
  danger = false,
}: TaskStatProps) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        danger
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-100 text-red-600"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>

        <div>

          <p
            className={`text-xs ${
              danger
                ? "text-red-600"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${
              danger
                ? "text-red-700"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}