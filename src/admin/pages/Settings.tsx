import {
  Bell,
  Building2,
  CheckCircle2,
  Globe2,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import type { UpdateSettingsRequest } from "../api/settingsApi";
import useAdminSettings from "../../admin/hooks/useAdminSettings.ts";

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          {label}
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${
          checked
            ? "bg-slate-900"
            : "bg-slate-300"
        } ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SectionHeader({
  icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Settings() {
  const {
    settings,
    isLoading,
    isError,
    error,
    updateSettings,
    isUpdating,
  } = useAdminSettings();

  const [form, setForm] =
    useState<UpdateSettingsRequest>({
      applicationName: "ProjectFlow",
      companyName: "",
      timezone: "Asia/Kolkata",
      defaultProjectStatus: "Planning",
      defaultTaskPriority: "Medium",
      allowEmployeeCreateProjects: false,
      allowEmployeeCreateTasks: true,
      requireTaskAssignment: true,
      emailNotifications: true,
      taskNotifications: true,
      projectNotifications: true,
    });

 
  // LOAD SETTINGS
 

  useEffect(() => {
    if (!settings) {
      return;
    }

    setForm({
      applicationName:
        settings.applicationName ?? "ProjectFlow",

      companyName:
        settings.companyName ?? "",

      timezone:
        settings.timezone ?? "Asia/Kolkata",

      defaultProjectStatus:
        settings.defaultProjectStatus ??
        "Planning",

      defaultTaskPriority:
        settings.defaultTaskPriority ??
        "Medium",

      allowEmployeeCreateProjects:
        settings.allowEmployeeCreateProjects ??
        false,

      allowEmployeeCreateTasks:
        settings.allowEmployeeCreateTasks ??
        true,

      requireTaskAssignment:
        settings.requireTaskAssignment ??
        true,

      emailNotifications:
        settings.emailNotifications ??
        true,

      taskNotifications:
        settings.taskNotifications ??
        true,

      projectNotifications:
        settings.projectNotifications ??
        true,
    });
  }, [settings]);

 
  // UPDATE FIELD
 

  const updateField = <
    K extends keyof UpdateSettingsRequest,
  >(
    field: K,
    value: UpdateSettingsRequest[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

 
  // SAVE
 

  const handleSave = async () => {
    try {
      await updateSettings(form);

      toast.success(
        "System settings updated successfully.",
      );
    } catch (saveError) {
      console.error(
        "SETTINGS SAVE ERROR:",
        saveError,
      );

      toast.error(
        "Failed to update system settings.",
      );
    }
  };

 
  // LOADING
 

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2
            size={28}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

 
  // ERROR
 

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <ShieldCheck size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-red-800">
                Unable to load settings
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error instanceof Error
                  ? error.message
                  : "Unknown error occurred while loading settings."}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RotateCcw size={15} />

                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

 
  // UI
 

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-8">
      {/*
                HEADER
     
      */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <SettingsIcon size={20} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              System settings
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Configure ProjectFlow for your organization.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isUpdating}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isUpdating ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save size={17} />
          )}

          {isUpdating
            ? "Saving..."
            : "Save changes"}
        </button>
      </header>

      {/*
                GENERAL
     
      */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={<Building2 size={19} />}
          title="General"
          description="Basic application information."
        />

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Application name */}

          <div>
            <label
              htmlFor="application-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Application name
            </label>

            <input
              id="application-name"
              type="text"
              value={form.applicationName}
              onChange={(event) =>
                updateField(
                  "applicationName",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Company name */}

          <div>
            <label
              htmlFor="company-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Company name
            </label>

            <input
              id="company-name"
              type="text"
              value={form.companyName}
              placeholder="Your company"
              onChange={(event) =>
                updateField(
                  "companyName",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Timezone */}

          <div>
            <label
              htmlFor="timezone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Timezone
            </label>

            <div className="relative">
              <Globe2
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <select
                id="timezone"
                value={form.timezone}
                onChange={(event) =>
                  updateField(
                    "timezone",
                    event.target.value,
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="Asia/Kolkata">
                  India - Asia/Kolkata
                </option>

                <option value="UTC">
                  UTC
                </option>

                <option value="America/New_York">
                  America/New_York
                </option>

                <option value="Europe/London">
                  Europe/London
                </option>

                <option value="Asia/Dubai">
                  Asia/Dubai
                </option>

                <option value="Asia/Singapore">
                  Asia/Singapore
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/*
                PROJECT / TASK DEFAULTS
     
      */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={<CheckCircle2 size={19} />}
          title="Project and task defaults"
          description="Default values for new work."
        />

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          {/* Project status */}

          <div>
            <label
              htmlFor="default-project-status"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Default project status
            </label>

            <select
              id="default-project-status"
              value={
                form.defaultProjectStatus
              }
              onChange={(event) =>
                updateField(
                  "defaultProjectStatus",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="Planning">
                Planning
              </option>

              <option value="Active">
                Active
              </option>

              <option value="On Hold">
                On Hold
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>
          </div>

          {/* Task priority */}

          <div>
            <label
              htmlFor="default-task-priority"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Default task priority
            </label>

            <select
              id="default-task-priority"
              value={
                form.defaultTaskPriority
              }
              onChange={(event) =>
                updateField(
                  "defaultTaskPriority",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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

              <option value="Urgent">
                Urgent
              </option>
            </select>
          </div>
        </div>
      </section>

      {/*
                EMPLOYEE ACCESS
     
      */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={<Users size={19} />}
          title="Employee access"
          description="Configure what employees can create and modify."
        />

        <div className="flex flex-col gap-3 p-5">
          <Toggle
            label="Allow employees to create projects"
            description="Employees can create projects from their workspace."
            checked={
              form.allowEmployeeCreateProjects
            }
            disabled={isUpdating}
            onChange={(value) =>
              updateField(
                "allowEmployeeCreateProjects",
                value,
              )
            }
          />

          <Toggle
            label="Allow employees to create tasks"
            description="Employees can create tasks inside projects they can access."
            checked={
              form.allowEmployeeCreateTasks
            }
            disabled={isUpdating}
            onChange={(value) =>
              updateField(
                "allowEmployeeCreateTasks",
                value,
              )
            }
          />

          <Toggle
            label="Require task assignment"
            description="New tasks must have an employee assigned before completion."
            checked={
              form.requireTaskAssignment
            }
            disabled={isUpdating}
            onChange={(value) =>
              updateField(
                "requireTaskAssignment",
                value,
              )
            }
          />
        </div>
      </section>

      {/*
                NOTIFICATIONS
     
      */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={<Bell size={19} />}
          title="Notifications"
          description="Control organization-wide notifications."
        />

        <div className="flex flex-col gap-3 p-5">
          <Toggle
            label="Email notifications"
            description="Allow ProjectFlow to send notification emails."
            checked={
              form.emailNotifications
            }
            disabled={isUpdating}
            onChange={(value) =>
              updateField(
                "emailNotifications",
                value,
              )
            }
          />

          <Toggle
            label="Task notifications"
            description="Notify users about task assignments and updates."
            checked={
              form.taskNotifications
            }
            disabled={isUpdating}
            onChange={(value) =>
              updateField(
                "taskNotifications",
                value,
              )
            }
          />

          <Toggle
            label="Project notifications"
            description="Notify users when projects are created or updated."
            checked={
              form.projectNotifications
            }
            disabled={isUpdating}
            onChange={(value) =>
              updateField(
                "projectNotifications",
                value,
              )
            }
          />
        </div>
      </section>

      {/*
                ADMIN NOTICE
     
      */}

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
            <ShieldCheck size={19} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Administrator settings
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              These settings affect the entire
              workspace and should only be changed
              by users with system settings
              permission.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}