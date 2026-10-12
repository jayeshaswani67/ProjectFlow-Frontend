import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  Search,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getMyProjects } from "../api/projectApi";
import { useDebounce } from "../hooks/useDebounce";
import type {
  EmployeeProject,
  ProjectStatus,
} from "../types/project.types";

type StatusFilter = "All" | ProjectStatus;

export default function MyProjects() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [isPending, startTransition] = useTransition();
  const isSearchPending = searchInput !== debouncedSearch;

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<EmployeeProject[]>({
    queryKey: ["projects", "my"],
    queryFn: getMyProjects,
  });

  const filteredProjects = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, debouncedSearch, statusFilter]);

  const activeProjects = projects.filter(
    (project) => project.status === "Active",
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed",
  ).length;

  const overdueProjects = projects.filter(
    (project) =>
      project.dueDate &&
      new Date(project.dueDate) < new Date() &&
      project.status !== "Completed",
  ).length;

  const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
      case "Active":
        return "bg-blue-50 text-blue-700";

      case "Completed":
        return "bg-emerald-50 text-emerald-700";

      case "OnHold":
        return "bg-amber-50 text-amber-700";

      case "Planning":
        return "bg-slate-100 text-slate-700";

      case "Archived":
        return "bg-gray-100 text-gray-500";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/([A-Z])/g, " $1").trim();
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const isOverdue = (
    project: EmployeeProject,
  ) => {
    if (!project.dueDate) return false;

    if (project.status === "Completed") {
      return false;
    }

    return (
      new Date(project.dueDate) <
      new Date()
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FolderKanban size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Projects
              </h1>

              <p className="text-sm text-slate-500">
                Projects assigned to you
              </p>
            </div>

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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={<FolderKanban size={19} />}
        />

        <StatCard
          title="Active"
          value={activeProjects}
          icon={<Clock3 size={19} />}
        />

        <StatCard
          title="Completed"
          value={completedProjects}
          icon={<CheckCircle2 size={19} />}
        />

        <StatCard
          title="Overdue"
          value={overdueProjects}
          icon={<AlertCircle size={19} />}
          danger={overdueProjects > 0}
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
            placeholder="Search my projects..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />

        </div>

        <div className="flex flex-wrap gap-2">

          {[
            "All",
            "Planning",
            "Active",
            "OnHold",
            "Completed",
            "Archived",
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                startTransition(() =>
                  setStatusFilter(status as StatusFilter),
                )
              }
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "OnHold"
                ? "On Hold"
                : status}
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
                Unable to load projects
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

      {/* PROJECT LIST */}

      <div
        aria-busy={isPending || isSearchPending}
        className={`overflow-hidden rounded-2xl border border-slate-200 bg-white transition-opacity ${
          isPending || isSearchPending ? "opacity-60" : ""
        }`}
      >

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm text-slate-500">

              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading your projects...

            </div>

          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FolderKanban
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No projects found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {searchInput
                ? "Try changing your search or filter."
                : "No projects have been assigned to you yet."}
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {filteredProjects.map(
              (project) => (
                <div
                  key={project.id}
                  className="p-5 transition hover:bg-slate-50"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    {/* PROJECT INFO */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-base font-semibold text-slate-900">
                          {project.name}
                        </h2>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                            project.status,
                          )}`}
                        >
                          {formatStatus(
                            project.status,
                          )}
                        </span>

                      </div>

                      {project.description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          {project.description}
                        </p>
                      )}

                      {/* PROJECT META */}

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">

                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />

                          {isOverdue(project) ? (
                            <span className="font-medium text-red-600">
                              Overdue ·{" "}
                              {formatDate(
                                project.dueDate,
                              )}
                            </span>
                          ) : (
                            <>
                              Due{" "}
                              {formatDate(
                                project.dueDate,
                              )}
                            </>
                          )}
                        </span>

                        <span>
                          Priority:{" "}
                          <strong className="text-slate-700">
                            {project.priority}
                          </strong>
                        </span>

                        <span>
                          My Tasks:{" "}
                          <strong className="text-slate-700">
                            {project.myTaskCount ?? 0}
                          </strong>
                        </span>

                      </div>

                    </div>

                    {/* TASK COUNTS */}

                    <div className="grid grid-cols-3 gap-2 lg:min-w-[270px]">

                      <MiniMetric
                        label="Pending"
                        value={
                          project.pendingTaskCount ??
                          0
                        }
                      />

                      <MiniMetric
                        label="In Progress"
                        value={
                          project.inProgressTaskCount ??
                          0
                        }
                      />

                      <MiniMetric
                        label="Done"
                        value={
                          project.completedTaskCount ??
                          0
                        }
                      />

                    </div>

                  </div>

                </div>
              ),
            )}

          </div>
        )}

      </div>

    </div>
  );
}


/* ================================
   STAT CARD
================================ */

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  danger?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  danger = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        danger
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >

      <div className="flex items-start justify-between">

        <div>
          <p
            className={`text-sm ${
              danger
                ? "text-red-600"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              danger
                ? "text-red-700"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-100 text-red-600"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ================================
   MINI METRIC
================================ */

interface MiniMetricProps {
  label: string;
  value: number;
}

function MiniMetric({
  label,
  value,
}: MiniMetricProps) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">

      <p className="text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] text-slate-400">
        {label}
      </p>

    </div>
  );
}