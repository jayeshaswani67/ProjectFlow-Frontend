import {
  CheckCircle2,
  ClipboardCheck,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";

import { useDashboard } from "../hooks/useDashboard";

export default function ManagerDashboard() {
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
    tasks = [],
    teamMembers = [],
    submissions = [],
  } = data;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <p className="text-sm font-medium text-slate-500">
          Management
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Manager Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your projects, team and work progress.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          icon={<FolderKanban size={20} />}
          label="Active Projects"
          value={stats.activeProjects}
        />

        <Stat
          icon={<ListTodo size={20} />}
          label="Pending Tasks"
          value={stats.pendingTasks}
        />

        <Stat
          icon={<Users size={20} />}
          label="Team Members"
          value={stats.teamMembers}
        />

        <Stat
          icon={<ClipboardCheck size={20} />}
          label="Pending Reviews"
          value={stats.pendingReviews}
        />

      </div>

      {/* TASK SUMMARY */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <Summary
          label="In Progress"
          value={stats.inProgressTasks}
        />

        <Summary
          label="Completed"
          value={stats.completedTasks}
        />

        <Summary
          label="Overdue"
          value={stats.overdueTasks}
        />

      </div>

      {/* TWO COLUMNS */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* TEAM */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <h2 className="font-semibold text-slate-900">
              Team
            </h2>

          </div>

          <div className="divide-y divide-slate-100">

            {teamMembers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No team members.
              </p>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-5 py-4"
                >

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {member.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {member.email}
                    </p>
                  </div>

                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {member.role === "Developer"
                      ? "Employee"
                      : member.role}
                  </span>

                </div>
              ))
            )}

          </div>

        </section>

        {/* WORK REVIEW */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <h2 className="font-semibold text-slate-900">
              Work Review
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Recent employee submissions.
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {submissions.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No submissions waiting for review.
              </p>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between px-5 py-4"
                >

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Task #{submission.taskId}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(
                        submission.submittedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {submission.status}
                  </span>

                </div>
              ))
            )}

          </div>

        </section>

      </div>

      {/* TASKS */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="font-semibold text-slate-900">
            Recent Tasks
          </h2>

        </div>

        <div className="divide-y divide-slate-100">

          {tasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {task.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {task.priority}
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {task.status}
              </span>

            </div>
          ))}

        </div>

      </section>

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

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}