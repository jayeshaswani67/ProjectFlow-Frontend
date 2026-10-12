import { useCallback, useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import { toast } from "react-hot-toast";
import useThrottle from "../../hooks/useThrottle";
import useMediaQuery from "../../hooks/useMediaQuery";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";

import type {
  CreateProjectRequest,
  Project,
} from "../api/projectApi";

import { can } from "../../utils/permission.ts";

const PAGE_SIZE = 10;

const initialForm: CreateProjectRequest = {
  name: "",
  description: "",
  category: "",
  status: "Active",
  priority: "Medium",
  dueDate: "",
  teamMembers: [],
};

type RequiredField = "name" | "category" | "dueDate";
type FormErrors = Partial<Record<RequiredField, string>>;

export default function Projects() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // STATE
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const throttledSearch = useThrottle(search, 300);
  const [status, setStatus] = useState("");
  const throttledStatus = useThrottle(status, 300);

  const [showModal, setShowModal] = useState(false);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [form, setForm] =
    useState<CreateProjectRequest>(initialForm);
  const [formErrors, setFormErrors] =
    useState<FormErrors>({});
  const [teamMemberInput, setTeamMemberInput] =
    useState("");

  
    
  // QUERIES
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useProjects({
    page,
    pageSize: PAGE_SIZE,
    search: throttledSearch,
    status: throttledStatus,
  });

  const createProjectMutation =
    useCreateProject();

  const updateProjectMutation =
    useUpdateProject();

  const deleteProjectMutation =
    useDeleteProject();
  const createProject =
    createProjectMutation.mutateAsync;
  const updateProject =
    updateProjectMutation.mutateAsync;
  const deleteProject =
    deleteProjectMutation.mutateAsync;

  
    
  // DATA
  const projects = data?.items ?? [];

  const totalCount =
    data?.totalCount ?? 0;

  const totalPages =
    Math.max(data?.totalPages ?? 1, 1);

  
    
  // CREATE
  const handleCreate = useCallback(() => {
    setEditingProject(null);
    setFormErrors({});

    setForm({
      ...initialForm,
      teamMembers: [],
    });
    setTeamMemberInput("");

    setShowModal(true);
  }, []);

  
  
  // EDIT
  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setFormErrors({});

    setForm({
      name: project.name,
      description: project.description ?? "",
      category: project.category ?? "",
      status:
        project.status === "Inactive"
          ? "Inactive"
          : "Active",
      priority: project.priority ?? "Medium",
      dueDate: project.dueDate
        ? project.dueDate.slice(0, 10)
        : "",
      teamMembers:
        project.teamMembers ?? [],
    });
    setTeamMemberInput("");

    setShowModal(true);
  }, []);

  
  
  // CLOSE MODAL
  
  

  const handleCloseModal = useCallback(() => {
    if (
      createProjectMutation.isPending ||
      updateProjectMutation.isPending
    ) {
      return;
    }

    setShowModal(false);
    setEditingProject(null);

    setForm({
      ...initialForm,
      teamMembers: [],
    });
    setTeamMemberInput("");
    setFormErrors({});
  }, [
    createProjectMutation.isPending,
    updateProjectMutation.isPending,
  ]);

  const addTeamMember = useCallback(() => {
    const memberName = teamMemberInput.trim();
    if (!memberName) {
      return;
    }

    setForm((current) => {
      if (
        current.teamMembers.some(
          (member) =>
            member.toLowerCase() === memberName.toLowerCase(),
        )
      ) {
        return current;
      }

      return {
        ...current,
        teamMembers: [...current.teamMembers, memberName],
      };
    });
    setTeamMemberInput("");
  }, [teamMemberInput]);

  const removeTeamMember = useCallback((memberToRemove: string) => {
    setForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.filter(
        (member) => member !== memberToRemove,
      ),
    }));
  }, []);

  
  
  // FORM CHANGE
  
  

  const handleChange = useCallback((
    field: keyof CreateProjectRequest,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (
      field === "name" ||
      field === "category" ||
      field === "dueDate"
    ) {
      const isEmpty = field === "dueDate"
        ? !value
        : !value.trim();
      const errorMessage = field === "name"
        ? "Project name is required."
        : field === "category"
          ? "Project category is required."
          : "Due date is required.";

      setFormErrors((current) => ({
        ...current,
        [field]: isEmpty ? errorMessage : undefined,
      }));
    }
  }, []);

  
  
  // SUBMIT
  
  

  const handleSubmit = useCallback(async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationErrors: FormErrors = {};
    if (!form.name.trim()) {
      validationErrors.name = "Project name is required.";
    }
    if (!form.category.trim()) {
      validationErrors.category = "Project category is required.";
    }
    if (!form.dueDate) {
      validationErrors.dueDate = "Due date is required.";
    }

    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: CreateProjectRequest = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      teamMembers: form.teamMembers ?? [],
    };

    try {
      if (editingProject) {
        await updateProject({
          id: editingProject.id,
          data: payload,
        });

        toast.success(
          "Project updated successfully.",
        );
      } else {
        await createProject(payload);

        toast.success(
          "Project created successfully.",
        );
      }

      handleCloseModal();
    } catch (err) {
      console.error(
        "PROJECT SAVE ERROR:",
        err,
      );

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save project.",
      );
    }
  }, [
    createProject,
    editingProject,
    form,
    handleCloseModal,
    updateProject,
  ]);

  
  
  // DELETE
  
  

  const handleDelete = useCallback(async (
    project: Project,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(project.id);

      toast.success(
        "Project deleted successfully.",
      );

      if (
        projects.length === 1 &&
        page > 1
      ) {
        setPage((current) => current - 1);
      }
    } catch (err) {
      console.error(
        "PROJECT DELETE ERROR:",
        err,
      );

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to delete project.",
      );
    }
  }, [
    deleteProject,
    page,
    projects.length,
  ]);

  
  
  // STATUS STYLE
  
  

  const getStatusClasses = useCallback((
    projectStatus: string,
  ) => {
    switch (projectStatus) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

      case "Inactive":
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";

      case "Completed":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";

      case "On Hold":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    }
  }, []);

  
  
  // PRIORITY STYLE
  
  

  const getPriorityClasses = useCallback((
    priority: string,
  ) => {
    switch (priority) {
      case "Critical":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";

      case "High":
        return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";

      case "Medium":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";

      case "Low":
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";

      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    }
  }, []);

  
  
  // LOADING
  
  

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2
            size={28}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  
  
  // ERROR
  
  

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>
            <h2 className="font-semibold">
              Unable to load projects
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading projects."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  
  // UI
  
  

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <FolderKanban size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Projects
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Manage and track your projects.
              </p>
            </div>
          </div>

          {can("createProject") && (
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <Plus size={18} />

              New Project
            </button>
          )}
        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div
            className={
              isMobile
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-[minmax(0,1fr)_200px] gap-4"
            }
          >
            {/* Search */}

            <div>
              <label
                htmlFor="project-search"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Search
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="project-search"
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(
                      event.target.value,
                    );
                  }}
                  placeholder="Search projects..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            {/* Status */}

            <div>
              <label
                htmlFor="project-status"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="project-status"
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(
                    event.target.value,
                  );
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
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
        </div>

        {/* =====================================================
            COUNT
        ====================================================== */}

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {totalCount}
            </span>{" "}
            {totalCount === 1
              ? "project"
              : "projects"}
          </p>

          {isFetching && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2
                size={14}
                className="animate-spin"
              />

              Updating...
            </div>
          )}
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {projects.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================== */

            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <FolderKanban size={25} />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                No projects found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || status
                  ? "Try changing your search or filters."
                  : "Create your first project to get started."}
              </p>

              {!search &&
                !status &&
                can("createProject") && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus size={17} />

                    Create Project
                  </button>
                )}
            </div>
          ) : (
            <>
              {/* =================================================
                  RESPONSIVE TABLE
              ================================================== */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Project
                      </th>

                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Category
                      </th>

                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Priority
                      </th>

                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Progress
                      </th>

                      <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {projects.map(
                      (project) => (
                        <tr
                          key={project.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-b-0"
                        >
                          {/* Project */}

                          <td className="px-5 py-4">
                            <div className="max-w-[300px]">
                              <div className="font-semibold text-slate-900">
                                {project.name}
                              </div>

                              <div className="mt-1 truncate text-sm text-slate-500">
                                {project.description ||
                                  "No description"}
                              </div>
                            </div>
                          </td>

                          {/* Category */}

                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">
                              {project.category ||
                                "—"}
                            </span>
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                project.status,
                              )}`}
                            >
                              {project.status}
                            </span>
                          </td>

                          {/* Priority */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                                project.priority,
                              )}`}
                            >
                              {project.priority}
                            </span>
                          </td>

                          {/* Progress */}

                          <td className="px-5 py-4">
                            <div className="flex min-w-[150px] items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-slate-900 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        project.progress ??
                                          0,
                                        0,
                                      ),
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>

                              <span className="text-xs font-medium text-slate-600">
                                {project.progress ??
                                  0}
                                %
                              </span>
                            </div>
                          </td>

                          {/* Actions */}

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {can(
                                "editProject",
                              ) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      project,
                                    )
                                  }
                                  title="Edit project"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                >
                                  <Pencil
                                    size={17}
                                  />
                                </button>
                              )}

                              {can(
                                "deleteProject",
                              ) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      project,
                                    )
                                  }
                                  disabled={
                                    deleteProjectMutation.isPending
                                  }
                                  title="Delete project"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2
                                    size={17}
                                  />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-900">
                    {data?.page ?? page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      page <= 1 ||
                      isFetching
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          current - 1,
                          1,
                        ),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >= totalPages ||
                      isFetching
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next

                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingProject
                    ? "Edit Project"
                    : "Create Project"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {editingProject
                    ? "Update project details."
                    : "Create a new project for your workspace."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={
                  createProjectMutation.isPending ||
                  updateProjectMutation.isPending
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="space-y-5 px-6 py-6">
                {/* Project Name */}

                <div>
                  <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Project Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="project-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Enter project name"
                    aria-invalid={Boolean(formErrors.name)}
                    aria-describedby={formErrors.name ? "project-name-error" : undefined}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 ${
                      formErrors.name
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-300 focus:border-slate-500"
                    }`}
                  />
                  {formErrors.name && (
                    <p id="project-name-error" className="mt-1.5 text-xs text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Description */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      handleChange(
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Describe the project..."
                    rows={4}
                    className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Category + Status */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="project-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Category
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="project-category"
                      type="text"
                      value={
                        form.category
                      }
                      onChange={(event) =>
                        handleChange(
                          "category",
                          event.target.value,
                        )
                      }
                      placeholder="Development"
                      aria-invalid={Boolean(formErrors.category)}
                      aria-describedby={formErrors.category ? "project-category-error" : undefined}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 ${
                        formErrors.category
                          ? "border-red-400 focus:border-red-500"
                          : "border-slate-300 focus:border-slate-500"
                      }`}
                    />
                    {formErrors.category && (
                      <p id="project-category-error" className="mt-1.5 text-xs text-red-600">
                        {formErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      value={
                        form.status
                      }
                      onChange={(event) =>
                        handleChange(
                          "status",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
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

                {/* Priority + Due Date */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Priority
                    </label>

                    <select
                      value={
                        form.priority
                      }
                      onChange={(event) =>
                        handleChange(
                          "priority",
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

                      <option value="Critical">
                        Critical
                      </option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="project-due-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Due Date
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="project-due-date"
                        type="date"
                        value={
                          form.dueDate
                        }
                        onChange={(event) =>
                          handleChange(
                            "dueDate",
                            event.target.value,
                          )
                        }
                        aria-invalid={Boolean(formErrors.dueDate)}
                        aria-describedby={formErrors.dueDate ? "project-due-date-error" : undefined}
                        className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-slate-200 ${
                          formErrors.dueDate
                            ? "border-red-400 focus:border-red-500"
                            : "border-slate-300 focus:border-slate-500"
                        }`}
                      />
                    </div>
                    {formErrors.dueDate && (
                      <p id="project-due-date-error" className="mt-1.5 text-xs text-red-600">
                        {formErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <label
                    htmlFor="project-team-member"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Team Members
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="project-team-member"
                      type="text"
                      value={teamMemberInput}
                      onChange={(event) =>
                        setTeamMemberInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTeamMember();
                        }
                      }}
                      placeholder="Enter a team member name"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={addTeamMember}
                      disabled={!teamMemberInput.trim()}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  {form.teamMembers.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {form.teamMembers.map((member) => (
                        <li
                          key={member}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-sm text-slate-700"
                        >
                          <span>{member}</span>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(member)}
                            aria-label={`Remove ${member}`}
                            className="rounded-full p-1 text-slate-500 transition hover:bg-white hover:text-red-600"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Add each team member by name. Members will be included when the project is saved.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  disabled={
                    createProjectMutation.isPending ||
                    updateProjectMutation.isPending
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createProjectMutation.isPending ||
                    updateProjectMutation.isPending
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {(createProjectMutation.isPending ||
                    updateProjectMutation.isPending) && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {createProjectMutation.isPending ||
                  updateProjectMutation.isPending
                    ? "Saving..."
                    : editingProject
                      ? "Update Project"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}