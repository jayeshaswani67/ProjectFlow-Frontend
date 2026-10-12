import {
  BarChart3,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Users,
  AlertCircle,
} from "lucide-react";

import { useDashboard } from "../hooks/useDashboard";

export default function AdminDashboard() {
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
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "Failed to load dashboard."
        }
        onRetry={refetch}
      />
    );
  }

  const { stats, recentProjects = [] } = data;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <p className="text-sm font-medium text-slate-500">
          Administration
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Organization-wide project and team overview.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderKanban size={20} />}
        />

        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={<BarChart3 size={20} />}
        />

        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<ListTodo size={20} />}
        />

        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          icon={<Users size={20} />}
        />

      </div>

      {/* SECONDARY STATS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <InfoCard
          title="Completed Projects"
          value={stats.completedProjects}
        />

        <InfoCard
          title="Completed Tasks"
          value={stats.completedTasks}
        />

        <InfoCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
        />

      </div>

      {/* PROJECTS */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="text-base font-semibold text-slate-900">
            Recent Projects
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest projects across the organization.
          </p>

        </div>

        {recentProjects.length === 0 ? (
          <EmptyState message="No projects available." />
        ) : (
          <div className="divide-y divide-slate-100">

            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {project.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {project.description ||
                      "No description"}
                  </p>

                </div>

                <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {project.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="px-5 py-12 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

      <div className="flex items-center gap-3">

        <AlertCircle
          size={20}
          className="text-red-500"
        />

        <p className="text-sm text-red-700">
          {message}
        </p>

      </div>

      <button
        type="button"
        onClick={() => onRetry()}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Retry
      </button>

    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="h-16 w-64 animate-pulse rounded-xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
          />
        ))}

      </div>
    </>
  );
}