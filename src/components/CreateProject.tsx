import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Plus,
  Loader2,
} from "lucide-react";
import {
  createProject,
  type CreateProjectRequest,
} from "../api/projectApi";
import { getUsers, type User } from "../admin/api/userApi";

interface CreateProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateProject({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectProps) {
  const managersQuery = useQuery<User[]>({
    queryKey: ["users", "project-managers"],
    queryFn: getUsers,
    enabled: isOpen,
    select: (users) =>
      users.filter(
        (user) =>
          user.role === "Manager" &&
          user.status === "Active",
      ),
  });

  const [form, setForm] =
    useState<CreateProjectRequest>({
      name: "",
      description: "",
      category: "Software",
      status: "Planning",
      priority: "Medium",
      dueDate: "",
      teamMembers: [],
    });

  const [teamLeaderId, setTeamLeaderId] = useState("");
  const [teamMemberInput, setTeamMemberInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!isOpen) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTeamMember = () => {
    const member =
      teamMemberInput.trim();

    if (!member) {
      return;
    }

    if (form.teamMembers.includes(member)) {
      setTeamMemberInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        member,
      ],
    }));

    setTeamMemberInput("");
  };

  const removeTeamMember = (
    member: string
  ) => {
    setForm((prev) => ({
      ...prev,
      teamMembers:
        prev.teamMembers.filter(
          (item) => item !== member
        ),
    }));
  };

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!form.dueDate) {
      setError("Due date is required.");
      return;
    }

    if (!teamLeaderId) {
      setError("Please select a team leader.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        name: form.name.trim(),
        description:
          form.description.trim(),
        dueDate: new Date(
          form.dueDate
        ).toISOString(),
        teamMembers: Array.from(
          new Set([...form.teamMembers, teamLeaderId]),
        ),
      };

      console.log(
        "Creating project:",
        payload
      );

      const project =
        await createProject(payload);

      console.log(
        "Project created:",
        project
      );

      setForm({
        name: "",
        description: "",
        category: "Software",
        status: "Planning",
        priority: "Medium",
        dueDate: "",
        teamMembers: [],
      });

      setTeamLeaderId("");
      setTeamMemberInput("");

      onCreated();
      onClose();
    } catch (err: unknown) {
      console.error(
        "Create project error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create New Project
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a new project to your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto p-6"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Project Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. ProjectFlow SaaS"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              disabled={loading}
            />
          </div>

          {/* Category / Status */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="Software">
                  Software
                </option>
                <option value="Marketing">
                  Marketing
                </option>
                <option value="Design">
                  Design
                </option>
                <option value="Research">
                  Research
                </option>
                <option value="Business">
                  Business
                </option>
                <option value="General">
                  General
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="Planning">
                  Planning
                </option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Completed">
                  Completed
                </option>
                <option value="On Hold">
                  On Hold
                </option>
              </select>
            </div>
          </div>

          {/* Priority / Due Date */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
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
                <option value="Critical">
                  Critical
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Team Leader */}
          <div className="mb-5">
            <label
              htmlFor="teamLeaderId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Team Leader (Manager)
            </label>

            <select
              id="teamLeaderId"
              value={teamLeaderId}
              onChange={(event) =>
                setTeamLeaderId(event.target.value)
              }
              disabled={loading || managersQuery.isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="">
                {managersQuery.isLoading
                  ? "Loading managers..."
                  : "Select a manager"}
              </option>
              {managersQuery.data?.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>

            {managersQuery.isError && (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm text-red-600" role="alert">
                <span>Unable to load managers.</span>
                <button
                  type="button"
                  onClick={() => void managersQuery.refetch()}
                  className="font-medium underline"
                >
                  Try again
                </button>
              </div>
            )}

            {managersQuery.isSuccess &&
              managersQuery.data.length === 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  No active managers are available to assign.
                </p>
              )}

            <p className="mt-2 text-xs text-slate-500">
              The selected manager will be included in the project team.
            </p>
          </div>

          {/* Team Members */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Team Members
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={teamMemberInput}
                onChange={(e) =>
                  setTeamMemberInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    e.preventDefault();
                    addTeamMember();
                  }
                }}
                placeholder="Enter member name"
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <button
                type="button"
                onClick={addTeamMember}
                disabled={loading}
                className="rounded-xl bg-slate-100 px-4 text-slate-700 transition hover:bg-slate-200"
              >
                <Plus size={18} />
              </button>
            </div>

            {form.teamMembers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.teamMembers.map(
                  (member) => (
                    <div
                      key={member}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                    >
                      <span>
                        {member}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeTeamMember(
                            member
                          )
                        }
                        disabled={loading}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}