
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  getAnalytics,
  type AnalyticsData,
} from "../api/analyticsApi";

import {
  can,
  getUserRole,
  type UserRole,
} from "../../utils/permission";

/* 
   TYPES
 */

type ToastType = "success" | "error";

interface ToastState {
  type: ToastType;
  message: string;
}

/* 
   EMPTY DATA
 */

const emptyAnalytics: AnalyticsData = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  planningProjects: 0,

  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  overdueTasks: 0,

  teamMembers: 0,
  activeMembers: 0,

  completionRate: 0,

  monthlyCompletedTasks: [],
  projectPerformance: [],
  teamPerformance: [],
};

/* 
   ROLE HELPERS
 */

function getRoleLabel(role: UserRole | null) {
  if (role === "Employee") {
    return "Employee";
  }

  return role ?? "Employee";
}

function getRoleDescription(role: UserRole | null) {
  switch (role) {
    case "Admin":
      return "Organization-wide performance and workspace analytics.";

    case "Manager":
      return "Team performance, project health, and delivery analytics.";

    case "Employee":
      return "Your personal productivity, tasks, and project progress.";

    default:
      return "Your ProjectFlow analytics.";
  }
}

/* 
   TOAST
 */

function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  return (
    <div className="fixed right-5 top-5 z-[100] w-[360px] max-w-[calc(100vw-40px)]">
      <div
        className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
          toast.type === "success"
            ? "border-emerald-200"
            : "border-red-200"
        }`}
      >
        <div
          className={`mt-0.5 rounded-full p-1.5 ${
            toast.type === "success"
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {toast.type === "success" ? "Success" : "Error"}
          </p>

          <p className="mt-0.5 text-sm text-slate-500">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}

/* 
   STAT CARD
 */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="mb-1 flex items-center justify-between">
        <div className={`rounded-xl p-2.5 ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/* 
   PROGRESS BAR
 */

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-slate-900 transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

/* 
   METRIC ROW
 */

function MetricRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>

        <span className="text-sm font-bold text-slate-800">
          {value}
        </span>
      </div>

      <ProgressBar value={percentage} />
    </div>
  );
}

/* 
   MINI METRIC
 */

function MiniMetric({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div
        className={`mb-3 inline-flex rounded-lg p-2 ${className}`}
      >
        {icon}
      </div>

      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* 
   EMPTY STATE
 */

function EmptyAnalytics() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
      <BarChart3
        size={28}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 text-sm font-semibold text-slate-600">
        No analytics data available
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Data will appear once your workspace has activity.
      </p>
    </div>
  );
}

/* 
   ADMIN ANALYTICS
 */

function AdminAnalytics({
  data,
}: {
  data: AnalyticsData;
}) {
  return (
    <>
      {/* ADMIN STATS */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={data.totalProjects}
          subtitle={`${data.activeProjects} active projects`}
          icon={<FolderKanban size={20} />}
          iconClass="bg-slate-100 text-slate-700"
        />

        <StatCard
          title="Total Tasks"
          value={data.totalTasks}
          subtitle={`${data.completedTasks} completed`}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Team Members"
          value={data.teamMembers}
          subtitle={`${data.activeMembers} active`}
          icon={<Users size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          subtitle="Workspace task completion"
          icon={<TrendingUp size={20} />}
          iconClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* PROJECT + TASK OVERVIEW */}

      <div className="mt-2 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900">
              Project Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organization-wide project status.
            </p>
          </div>

          <div className="space-y-3">
            <MetricRow
              label="Active Projects"
              value={data.activeProjects}
              total={data.totalProjects}
            />

            <MetricRow
              label="Completed Projects"
              value={data.completedProjects}
              total={data.totalProjects}
            />

            <MetricRow
              label="Planning Projects"
              value={data.planningProjects}
              total={data.totalProjects}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900">
              Task Health
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current workspace task distribution.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MiniMetric
              label="Completed"
              value={data.completedTasks}
              icon={<CheckCircle2 size={18} />}
              className="bg-emerald-50 text-emerald-700"
            />

            <MiniMetric
              label="Pending"
              value={data.pendingTasks}
              icon={<Clock3 size={18} />}
              className="bg-amber-50 text-amber-700"
            />

            <MiniMetric
              label="Overdue"
              value={data.overdueTasks}
              icon={<AlertCircle size={18} />}
              className="bg-red-50 text-red-700"
            />

            <MiniMetric
              label="Completion"
              value={`${data.completionRate}%`}
              icon={<Target size={18} />}
              className="bg-blue-50 text-blue-700"
            />
          </div>
        </div>
      </div>

      {/* PROJECT PERFORMANCE */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Project Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organization-wide project progress.
            </p>
          </div>

          <BarChart3
            size={20}
            className="text-slate-400"
          />
        </div>

        {data.projectPerformance.length === 0 ? (
          <EmptyAnalytics />
        ) : (
          <div className="space-y-5">
            {data.projectPerformance.map((project) => (
              <div key={project.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {project.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {project.completedTasks} /{" "}
                      {project.totalTasks} tasks
                    </p>
                  </div>

                  <span className="text-sm font-bold text-slate-700">
                    {project.progress}%
                  </span>
                </div>

                <ProgressBar value={project.progress} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TEAM PERFORMANCE */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900">
            Team Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Productivity across the organization.
          </p>
        </div>

        {data.teamPerformance.length === 0 ? (
          <EmptyAnalytics />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Member
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Completed
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Tasks
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Completion
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.teamPerformance.map((member) => (
                  <tr
                    key={member.name}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-4 text-sm font-semibold text-slate-800">
                      {member.name}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {member.completedTasks}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {member.totalTasks}
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-28">
                          <ProgressBar
                            value={member.completionRate}
                          />
                        </div>

                        <span className="text-xs font-bold text-slate-600">
                          {member.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* 
   MANAGER ANALYTICS
 */

function ManagerAnalytics({
  data,
}: {
  data: AnalyticsData;
}) {
  return (
    <>
      {/* MANAGER STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={data.activeProjects}
          subtitle={`${data.totalProjects} total projects`}
          icon={<FolderKanban size={20} />}
          iconClass="bg-slate-100 text-slate-700"
        />

        <StatCard
          title="Team Tasks"
          value={data.totalTasks}
          subtitle={`${data.completedTasks} completed`}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Overdue Tasks"
          value={data.overdueTasks}
          subtitle="Requires attention"
          icon={<AlertCircle size={20} />}
          iconClass="bg-red-50 text-red-600"
        />

        <StatCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          subtitle="Team delivery rate"
          icon={<TrendingUp size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />
      </div>

      {/* ATTENTION */}

      {data.overdueTasks > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <AlertCircle
            size={20}
            className="mt-0.5 text-amber-600"
          />

          <div>
            <p className="text-sm font-bold text-amber-900">
              Manager attention required
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Your team currently has{" "}
              <strong>{data.overdueTasks}</strong>{" "}
              overdue task
              {data.overdueTasks !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>
      )}

      {/* TEAM HEALTH */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Delivery Health
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current team delivery metrics.
          </p>

          <div className="mt-6 space-y-5">
            <MetricRow
              label="Completed Tasks"
              value={data.completedTasks}
              total={data.totalTasks}
            />

            <MetricRow
              label="Pending Tasks"
              value={data.pendingTasks}
              total={data.totalTasks}
            />

            <MetricRow
              label="Overdue Tasks"
              value={data.overdueTasks}
              total={data.totalTasks}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Team Capacity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current team membership.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <MiniMetric
              label="Team Members"
              value={data.teamMembers}
              icon={<Users size={18} />}
              className="bg-blue-50 text-blue-700"
            />

            <MiniMetric
              label="Active Members"
              value={data.activeMembers}
              icon={<Activity size={18} />}
              className="bg-emerald-50 text-emerald-700"
            />

            <MiniMetric
              label="Projects"
              value={data.activeProjects}
              icon={<FolderKanban size={18} />}
              className="bg-slate-100 text-slate-700"
            />

            <MiniMetric
              label="Overdue"
              value={data.overdueTasks}
              icon={<AlertCircle size={18} />}
              className="bg-red-50 text-red-700"
            />
          </div>
        </div>
      </div>

      {/* PROJECT PERFORMANCE */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900">
            Project Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Projects managed by your team.
          </p>
        </div>

        {data.projectPerformance.length === 0 ? (
          <EmptyAnalytics />
        ) : (
          <div className="space-y-5">
            {data.projectPerformance.map((project) => (
              <div key={project.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {project.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {project.completedTasks} /{" "}
                      {project.totalTasks} tasks
                    </p>
                  </div>

                  <span className="text-sm font-bold text-slate-700">
                    {project.progress}%
                  </span>
                </div>

                <ProgressBar value={project.progress} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TEAM WORKLOAD */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900">
            Team Workload
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare task completion across your team.
          </p>
        </div>

        {data.teamPerformance.length === 0 ? (
          <EmptyAnalytics />
        ) : (
          <div className="space-y-4">
            {data.teamPerformance.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-slate-100 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {member.name}
                  </span>

                  <span className="text-xs font-bold text-slate-500">
                    {member.completionRate}%
                  </span>
                </div>

                <ProgressBar
                  value={member.completionRate}
                />

                <p className="mt-2 text-xs text-slate-400">
                  {member.completedTasks} completed of{" "}
                  {member.totalTasks} tasks
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* 
   EMPLOYEE ANALYTICS
 */

function EmployeeAnalytics({
  data,
}: {
  data: AnalyticsData;
}) {
  return (
    <>
      {/* PERSONAL STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My Projects"
          value={data.totalProjects}
          subtitle={`${data.activeProjects} active`}
          icon={<FolderKanban size={20} />}
          iconClass="bg-slate-100 text-slate-700"
        />

        <StatCard
          title="My Tasks"
          value={data.totalTasks}
          subtitle={`${data.pendingTasks} pending`}
          icon={<Activity size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Completed"
          value={data.completedTasks}
          subtitle="Tasks completed"
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          subtitle="Personal productivity"
          icon={<Target size={20} />}
          iconClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* PERSONAL ATTENTION */}

      {data.overdueTasks > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertCircle
            size={20}
            className="mt-0.5 text-red-600"
          />

          <div>
            <p className="text-sm font-bold text-red-900">
              You have overdue work
            </p>

            <p className="mt-1 text-sm text-red-700">
              You currently have{" "}
              <strong>{data.overdueTasks}</strong>{" "}
              overdue task
              {data.overdueTasks !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>
      )}

      {/* PERSONAL HEALTH */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            My Task Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current task distribution.
          </p>

          <div className="mt-6 space-y-5">
            <MetricRow
              label="Completed"
              value={data.completedTasks}
              total={data.totalTasks}
            />

            <MetricRow
              label="Pending"
              value={data.pendingTasks}
              total={data.totalTasks}
            />

            <MetricRow
              label="Overdue"
              value={data.overdueTasks}
              total={data.totalTasks}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Productivity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current performance.
          </p>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Completion Rate
              </span>

              <span className="text-2xl font-bold text-slate-900">
                {data.completionRate}%
              </span>
            </div>

            <ProgressBar value={data.completionRate} />

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp
                size={16}
                className="text-emerald-500"
              />

              Keep completing tasks to improve your productivity.
            </div>
          </div>
        </div>
      </div>

      {/* MY PROJECTS */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900">
            My Project Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Progress across your assigned projects.
          </p>
        </div>

        {data.projectPerformance.length === 0 ? (
          <EmptyAnalytics />
        ) : (
          <div className="space-y-5">
            {data.projectPerformance.map((project) => (
              <div key={project.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {project.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {project.completedTasks} /{" "}
                      {project.totalTasks} tasks
                    </p>
                  </div>

                  <span className="text-sm font-bold text-slate-700">
                    {project.progress}%
                  </span>
                </div>

                <ProgressBar value={project.progress} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* 
   MAIN ANALYTICS PAGE
 */

export default function Analytics() {
  const [data, setData] =
    useState<AnalyticsData>(emptyAnalytics);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const userRole = getUserRole();

  const canViewAnalytics = can("viewAnalytics");

  const roleLabel = getRoleLabel(userRole);

  const roleDescription =
    getRoleDescription(userRole);

  /* 
     ROLE THEME
   */

  const roleTheme = useMemo(() => {
    switch (userRole) {
      case "Admin":
        return {
          badge: "bg-purple-50 text-purple-700",
          icon: "bg-purple-50 text-purple-600",
        };

      case "Manager":
        return {
          badge: "bg-blue-50 text-blue-700",
          icon: "bg-blue-50 text-blue-600",
        };

      default:
        return {
          badge: "bg-slate-100 text-slate-700",
          icon: "bg-slate-100 text-slate-600",
        };
    }
  }, [userRole]);

  /* 
     LOAD ANALYTICS API
   */

  const loadAnalytics = useCallback(async () => {
    if (!canViewAnalytics) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

   

      const response = await getAnalytics();

      setData({
        ...emptyAnalytics,
        ...response,
      });

      setToast({
        type: "success",
        message: "Analytics updated successfully.",
      });
    } catch (err: any) {
      console.error(
        "Failed to load analytics:",
        err
      );

      const message =
        err?.response?.data?.message ||
        "Failed to load analytics.";

      setError(message);

      setToast({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  }, [canViewAnalytics]);

  /* 
     INITIAL LOAD
   */

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  /* 
     ACCESS DENIED
   */

  if (!canViewAnalytics) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={30} />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Analytics Restricted
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your current role does not have permission
              to access analytics.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Current Role
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* 
     PAGE
   */

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      {toast && (
        <Toast
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <BarChart3 size={16} />

            <span>Workspace</span>

            <span>/</span>

            <span className="text-slate-700">
              Analytics
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Analytics
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${roleTheme.badge}`}
            >
              {roleLabel}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {roleDescription}
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
        >
          {loading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={17} />
          )}

          Refresh
        </button>
      </div>

      {/* ROLE INFORMATION */}

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div
          className={`rounded-xl p-2 ${roleTheme.icon}`}
        >
          <BarChart3 size={18} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {roleLabel} Analytics
          </p>

          <p className="mt-0.5 text-sm text-slate-500">
            {roleDescription}
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && !loading && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle
              size={20}
              className="text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-900">
                Analytics unavailable
              </p>

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>

          <button
            onClick={loadAnalytics}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />

            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>

          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      ) : (
        <>
          {/* ADMIN */}

          {userRole === "Admin" && (
            <AdminAnalytics data={data} />
          )}

          {/* MANAGER */}

          {userRole === "Manager" && (
            <ManagerAnalytics data={data} />
          )}

          {/* EMPLOYEE */}

          {userRole === "Employee" && (
            <EmployeeAnalytics data={data} />
          )}

          {/* FALLBACK */}

          {!userRole && (
            <EmployeeAnalytics data={data} />
          )}
        </>
      )}
    </div>
  );
}
