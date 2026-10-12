import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Send,
} from "lucide-react";

import { useDashboard } from "../hooks/useDashboard";

export default function EmployeeDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">

        <div className="h-16 w-64 animate-pulse rounded-xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}

        </div>

      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <p className="text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "Failed to load dashboard."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>

      </div>
    );
  }

  const {
    stats,
    recentProjects = [],
    tasks = [],
    submissions = [],
  } = data;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <p className="text-sm font-medium text-slate-500">
          My Workspace
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Employee Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          See your projects, tasks and submitted work.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          icon={<FolderKanban size={20} />}
          label="My Projects"
          value={stats.activeProjects}
        />

        <Stat
          icon={<ListTodo size={20} />}
          label="Pending Tasks"
          value={stats.pendingTasks}
        />

        <Stat
          icon={<Clock3 size={20} />}
          label="In Progress"
          value={stats.inProgressTasks}
        />

        <Stat
          icon={<CheckCircle2 size={20} />}
          label="Completed"
          value={stats.completedTasks}
        />

      </div>

      {/* OVERDUE / SUBMISSIONS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

          <p className="text-sm font-medium text-red-700">
            Overdue Tasks
          </p>

          <p className="mt-2 text-2xl font-bold text-red-900">
            {stats.overdueTasks}
          </p>

        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-center gap-2">

            <Send
              size={17}
              className="text-blue-600"
            />

            <p className="text-sm font-medium text-blue-700">
              Submitted Work
            </p>

          </div>

          <p className="mt-2 text-2xl font-bold text-blue-900">
            {submissions.length}
          </p>

        </div>

      </div>

      {/* PROJECTS + TASKS */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* PROJECTS */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <h2 className="font-semibold text-slate-900">
              My Projects
            </h2>

          </div>

          <div className="divide-y divide-slate-100">

            {recentProjects.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No assigned projects.
              </p>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="px-5 py-4"
                >

                  <div className="flex items-center justify-between gap-3">

                    <p className="text-sm font-semibold text-slate-900">
                      {project.name}
                    </p>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {project.status}
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {project.description ||
                      "No description"}
                  </p>

                </div>
              ))
            )}

          </div>

        </section>

        {/* TASKS */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <h2 className="font-semibold text-slate-900">
              My Tasks
            </h2>

          </div>

          <div className="divide-y divide-slate-100">

            {tasks.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No assigned tasks.
              </p>
            ) : (
              tasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {task.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {task.priority}
                    </p>

                  </div>

                  <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {task.status}
                  </span>

                </div>
              ))
            )}

          </div>

        </section>

      </div>

    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}