
import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  Edit3,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";


import {
  getTasks,
  getTaskSummary,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  type TaskItem,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type TaskSummary,
} from "../api/taskApi";

import { getProjects, type Project } from "../../api/projectApi";
import { useDebounce } from "../../hooks/useDebounce";
import { can } from "../../utils/permission";
import { toast } from "react-hot-toast";

type TaskFilter =
  | "all"
  | "pending"
  | "in-progress"
  | "completed"
  | "upcoming"
  | "overdue";

const TASKS_PER_PAGE = 10;

const emptyForm = {
  projectId: "",
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  assignedTo: "",
  dueDate: "",
};

export default function Tasks() {
  const queryClient = useQueryClient();


  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);


  const [form, setForm] = useState(emptyForm);

  const canCreateTask = can("createTask");
  const canEditTask = can("editTask");
  const canDeleteTask = can("deleteTask");

  const tasksQuery = useQuery<TaskItem[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 30_000,
  });



 const summaryQuery = useQuery<TaskSummary>({
  queryKey: ["task-summary"],
  queryFn: getTaskSummary,
  staleTime: 30_000,
 })

  // LOAD PROJECTS

const projectsQuery =
    useQuery<Project[]>({
      queryKey: ["projects"],
      queryFn: async () => {
        const projects: Project[] = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const result = await getProjects({
            page: currentPage,
            pageSize: 100,
          });

          projects.push(...result.items);
          totalPages = result.totalPages;
          currentPage += 1;
        } while (currentPage <= totalPages);

        return projects;
      },
      staleTime: 60_000,
    });
    //create task
    const createTaskMutation = useMutation({
      mutationFn: (payload: CreateTaskRequest) => createTask(form.projectId, payload),
      onSuccess: async () => {
        setForm(emptyForm);
        setShowCreateModal(false);
        toast.success("Task created successfully.");

        await queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["task-summary"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
      },
      onError: (error) => {
        console.error("Failed to create task:", error);
        toast.error(error instanceof Error ? error.message : "Failed to create task.");

      },
    });
    const updateTaskMutation = useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: UpdateTaskRequest;
      }) => updateTask(id, payload),
      onSuccess: async () => {
        setForm(emptyForm);
        setEditingTask(null);
        setShowCreateModal(false);
        toast.success("Task updated successfully.");

        await queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["task-summary"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
      },
      onError: (error) => {
        console.error("Failed to update task:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update task.");
      },
    });
    //update the task 
    const updateStatusMutation =
    useMutation({
      mutationFn: ({
        id,
        status,
      }: {
        id: string;
        status: string;
      }) =>
        updateTaskStatus(
          id,
          status
        ),

      onSuccess: async () => {
        toast.success("Task status updated successfully.");
        await queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });

        await queryClient.invalidateQueries({
          queryKey: ["task-summary"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
      },

      onError: (error) => {
        console.error(
          "Failed to update task status:",
          error
        );

        toast.error(error instanceof Error ? error.message : "Failed to update task status.");
      },
    });



  // DELETE TASK
const deleteTaskMutation =
    useMutation({
      mutationFn: deleteTask,

      onSuccess: async () => {
        toast.success("Task deleted successfully.");
        await queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });

        await queryClient.invalidateQueries({
          queryKey: ["task-summary"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
      },

      onError: (error) => {
        console.error(
          "Failed to delete task:",
          error
        );

        toast.error(error instanceof Error ? error.message : "Failed to delete task.");
      },
    });

     const handleCreateTask = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.projectId) {
      toast.error("Please select a project.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    if (!form.dueDate) {
      toast.error("Please select a due date.");
      return;
    }

    const payload: CreateTaskRequest = {
      title: form.title.trim(),
      description:
        form.description.trim(),

      status: form.status,

      priority: form.priority,

      assignedTo:
        form.assignedTo.trim(),

      dueDate: new Date(
        `${form.dueDate}T00:00:00`
      ).toISOString(),
    };

    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        payload: {
          ...payload,
          projectId: form.projectId,
        },
      });
      return;
    }

    createTaskMutation.mutate(payload);
  };

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setForm({
      projectId: task.projectId,
      title: task.title ?? "",
      description: task.description ?? "",
      status: task.status ?? "Pending",
      priority: task.priority ?? "Medium",
      assignedTo: task.assignedTo ?? "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setShowCreateModal(true);
  };

  const closeTaskModal = () => {
    if (createTaskMutation.isPending || updateTaskMutation.isPending) {
      return;
    }

    setShowCreateModal(false);
    setEditingTask(null);
    setForm(emptyForm);
  };

  const handleStatusChange = (
    taskId: string,
    status: string
  ) => {
    updateStatusMutation.mutate({
      id: taskId,
      status,
    });
  };

  const handleDelete = (
    taskId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) {
      return;
    }

    deleteTaskMutation.mutate(
      taskId
    );
  };

  //data 
    const tasks =
    tasksQuery.data ?? [];

  const projects =
    projectsQuery.data ?? [];

  const summary =
    summaryQuery.data ?? {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      today: 0,
      overdue: 0,
    };


  // SEARCH
   const searchQuery =
    debouncedSearch.toLowerCase().trim();

  const filteredTasks = tasks.filter((task) => {
      const normalizedStatus = task.status
        ?.trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "-");

      const matchesFilter = (() => {
        switch (filter) {
          case "pending":
            return normalizedStatus === "pending";
          case "in-progress":
            return normalizedStatus === "in-progress";
          case "completed":
            return normalizedStatus === "completed";
          case "upcoming":
            return normalizedStatus !== "completed" && !isOverdue(task);
          case "overdue":
            return isOverdue(task);
          case "all":
          default:
            return true;
        }
      })();

      if (!matchesFilter) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      return (
        task.title
          ?.toLowerCase()
          .includes(searchQuery) ||

        task.description
          ?.toLowerCase()
          .includes(searchQuery) ||

        task.status
          ?.toLowerCase()
          .includes(searchQuery) ||

        task.priority
          ?.toLowerCase()
          .includes(searchQuery) ||

        task.assignedTo
          ?.toLowerCase()
          .includes(searchQuery) ||

        getProjectName(
          task.projectId,
          projects
        )
          .toLowerCase()
          .includes(searchQuery)
      );
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / TASKS_PER_PAGE),
  );
  const activePage = Math.min(currentPage, totalPages);
  const paginatedTasks = filteredTasks.slice(
    (activePage - 1) * TASKS_PER_PAGE,
    activePage * TASKS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
    
    //loading 
    if (
      tasksQuery.isLoading ||
      projectsQuery.isLoading ||
      summaryQuery.isLoading
    ) {
      return (
         <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span>
            Loading tasks...
          </span>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (tasksQuery.isError) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">

          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

          <h2 className="mt-3 text-lg font-semibold text-red-800">
            Failed to load tasks
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {tasksQuery.error instanceof Error
              ? tasksQuery.error.message
              : "Something went wrong while loading tasks."}
          </p>

          <button
            onClick={() =>
              tasksQuery.refetch()
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* 
          HEADER
       */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
              <CheckSquare className="h-6 w-6 text-black" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tasks
              </h1>

              <p className="text-sm text-gray-500">
                Manage and track your project tasks
              </p>
            </div>
          </div>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white shadow-sm transition hover:bg-black"
          >
            <Plus className="h-5 w-5" />
            Create Task
          </button>
        )}
      </div>

      {/* 
          SUMMARY CARDS
       */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

        <SummaryCard
          label="Total"
          value={summary.total}
          active={filter === "all"}
          onClick={() => {
            setFilter("all");
            setCurrentPage(1);
          }}
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
          active={filter === "pending"}
          onClick={() => {
            setFilter("pending");
            setCurrentPage(1);
          }}
        />

        <SummaryCard
          label="In Progress"
          value={summary.inProgress}
          active={filter === "in-progress"}
          onClick={() => {
            setFilter("in-progress");
            setCurrentPage(1);
          }}
        />

        <SummaryCard
          label="Completed"
          value={summary.completed}
          active={filter === "completed"}
          onClick={() => {
            setFilter("completed");
            setCurrentPage(1);
          }}
        />

        <SummaryCard
          label="Upcoming"
          value={summary.today}
          active={filter === "upcoming"}
          onClick={() => {
            setFilter("upcoming");
            setCurrentPage(1);
          }}
        />

        <SummaryCard
          label="Overdue"
          value={summary.overdue}
          active={filter === "overdue"}
          onClick={() => {
            setFilter("overdue");
            setCurrentPage(1);
          }}
        />

      </div>

      {/* 
          SEARCH + FILTER
       */}

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md">

          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

        </div>

        <div className="flex flex-wrap gap-2">

          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["in-progress", "In Progress"],
            ["completed", "Completed"],
            ["upcoming", "Upcoming"],
            ["overdue", "Overdue"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setFilter(value as TaskFilter);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === value
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}

        </div>
      </div>
       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        {/* TABLE HEADER */}

        <div className="border-b border-gray-200 px-5 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Task List
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredTasks.length} task
                {filteredTasks.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            {tasksQuery.isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}

          </div>

        </div>

        {filteredTasks.length === 0 ? (

          /* EMPTY */

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <CheckSquare className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No tasks found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {search
                ? "Try changing your search."
                : "Create your first task to get started."}
            </p>

            {canCreateTask &&
              !search && (
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(
                      true
                    )
                  }
                  className="mt-5 flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white"
                >
                  <Plus className="h-4 w-4" />

                  Create Task
                </button>
              )}

          </div>

        ) : (

          /* TABLE */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Task
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Project
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Assigned To
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Priority
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Due Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {paginatedTasks.map(
                  (task) => {

                    const overdue =
                      isOverdue(task);

                    const statusUpdating =
                      updateStatusMutation.isPending &&
                      updateStatusMutation.variables?.id ===
                        task.id;

                    const deleting =
                      deleteTaskMutation.isPending &&
                      deleteTaskMutation.variables ===
                        task.id;

                    return (
                      <tr
                        key={task.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* TASK */}

                        <td className="px-5 py-4">

                          <div className="max-w-[280px]">

                            <div className="flex items-center gap-2">

                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <CheckSquare className="h-4 w-4 text-gray-600" />
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {task.title}
                                </p>

                                {task.description && (
                                  <p className="mt-1 truncate text-xs text-gray-500">
                                    {task.description}
                                  </p>
                                )}

                              </div>

                            </div>

                          </div>

                        </td>

                        {/* PROJECT */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-gray-700">
                            {getProjectName(
                              task.projectId,
                              projects
                            )}
                          </span>

                        </td>

                        {/* ASSIGNED */}

                        <td className="px-5 py-4">

                          {task.assignedTo ? (
                            <div className="flex items-center gap-2">

                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                                <User className="h-3.5 w-3.5 text-gray-500" />
                              </div>

                              <span className="max-w-[150px] truncate text-sm text-gray-700">
                                {task.assignedTo}
                              </span>

                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Unassigned
                            </span>
                          )}

                        </td>

                        {/* PRIORITY */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>

                        </td>

                        {/* DUE DATE */}

                        <td className="px-5 py-4">

                          <div
                            className={`flex items-center gap-2 text-sm ${
                              overdue
                                ? "font-medium text-red-600"
                                : "text-gray-600"
                            }`}
                          >

                            <Calendar className="h-4 w-4" />

                            <span>
                              {formatDate(
                                task.dueDate
                              )}
                            </span>

                          </div>

                          {overdue && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-500">

                              <AlertCircle className="h-3 w-3" />

                              Overdue

                            </div>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          {canEditTask ? (

                            <select
                              value={
                                task.status
                              }
                              disabled={
                                statusUpdating
                              }
                              onChange={(
                                event
                              ) =>
                                handleStatusChange(
                                  task.id,
                                  event.target
                                    .value
                                )
                              }
                              className={`rounded-lg border-0 px-3 py-2 text-xs font-medium outline-none ring-1 ring-inset ring-gray-200 ${getStatusClass(
                                task.status
                              )}`}
                            >

                              <option value="Pending">
                                Pending
                              </option>

                              <option value="In Progress">
                                In Progress
                              </option>

                              <option value="Completed">
                                Completed
                              </option>

                            </select>

                          ) : (

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <div
                              title={`Created ${formatDate(
                                task.createdAt
                              )}`}
                              className="hidden items-center gap-1 text-xs text-gray-400 xl:flex"
                            >
                              <Clock className="h-3.5 w-3.5" />

                              {formatDate(
                                task.createdAt
                              )}
                            </div>

                            {canEditTask && (
                              <button
                                type="button"
                                onClick={() => handleEdit(task)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                title="Edit task"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}

                            {canDeleteTask && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    task.id
                                  )
                                }
                                disabled={
                                  deleting
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete task"
                              >

                                {deleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}

                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {filteredTasks.length > 0 && (
        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500" aria-live="polite">
            Showing {(activePage - 1) * TASKS_PER_PAGE + 1} to {Math.min(activePage * TASKS_PER_PAGE, filteredTasks.length)} of {filteredTasks.length} tasks
          </p>

          <nav className="flex items-center gap-2" aria-label="Task pagination">
            <button
              type="button"
              onClick={() => setCurrentPage(activePage - 1)}
              disabled={activePage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="min-w-[5rem] text-center text-sm font-medium text-gray-700" aria-current="page">
              Page {activePage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage(activePage + 1)}
              disabled={activePage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}

      {/* ===================================================
          CREATE TASK MODAL
      =================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTask ? "Edit Task" : "Create Task"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingTask ? "Update task details" : "Add a new task to a project"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTaskModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreateTask
              }
              className="space-y-5 p-6"
            >

              {/* PROJECT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project *
                </label>

                <select
                  value={
                    form.projectId
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      projectId:
                        event.target
                          .value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                >

                  <option value="">
                    Select project
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={
                          project.id
                        }
                        value={
                          project.id
                        }
                      >
                        {
                          project.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Task Title *
                </label>

                <input
                  type="text"
                  value={
                    form.title
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title:
                        event.target
                          .value,
                    })
                  }
                  placeholder="e.g. Build authentication API"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Describe the task..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* GRID */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

                {/* PRIORITY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Priority
                  </label>

                  <select
                    value={
                      form.priority
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </div>

                {/* ASSIGNED TO */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Assigned To
                  </label>

                  <input
                    type="text"
                    value={
                      form.assignedTo
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        assignedTo:
                          event.target
                            .value,
                      })
                    }
                    placeholder="User ID"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Enter the assigned user's ID.
                  </p>

                </div>

                {/* DUE DATE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Due Date *
                  </label>

                  <input
                    type="date"
                    value={
                      form.dueDate
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        dueDate:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    required
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createTaskMutation.isPending || updateTaskMutation.isPending
                  }
                  className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {(createTaskMutation.isPending || updateTaskMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {createTaskMutation.isPending || updateTaskMutation.isPending
                    ? editingTask ? "Saving..." : "Creating..."
                    : editingTask ? "Save Changes" : "Create Task"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50"
      }`}
    >
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </button>
  );
}

/* =========================================================
   PROJECT NAME
========================================================= */

function getProjectName(
  projectId: string,
  projects: Project[]
) {
  const project =
    projects.find(
      (item) =>
        item.id === projectId
    );

  return (
    project?.name ??
    "Unknown Project"
  );
}

/* =========================================================
   PRIORITY
========================================================= */

function getPriorityClass(
  priority: string
) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-700";

    case "Low":
      return "bg-green-100 text-green-700";

    case "Medium":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

/* =========================================================
   STATUS
========================================================= */

function getStatusClass(
  status: string
) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";

    case "In Progress":
      return "bg-blue-100 text-blue-700";

    case "Pending":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

/* =========================================================
   OVERDUE
========================================================= */

function isOverdue(
  task: TaskItem
) {
  if (task.status === "Completed") {
    return false;
  }

  return (
    new Date(task.dueDate) <
    new Date()
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  date: string
) {
  if (!date) {
    return "-";
  }

  const parsedDate =
    new Date(date);

  if (Number.isNaN(
    parsedDate.getTime()
  )) {
    return "-";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}
