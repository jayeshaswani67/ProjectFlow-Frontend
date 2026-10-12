import { useCallback, useMemo, useState } from "react";
import { isAxiosError } from "axios";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTeamMember,
  deleteTeamMember,
  getTeamMembers,
  updateTeamMember,
} from "../api/teamApi";

import type {
  CreateTeamMemberRequest,
  TeamMember,
} from "../api/teamApi";

import {
  can,
  getUserRole,
  type UserRole,
} from "../../utils/permission";

/* =========================================================
   TYPES
========================================================= */

type ToastType = "success" | "error";

interface ToastState {
  type: ToastType;
  message: string;
}

interface TeamForm {
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  status: string;
}

type TeamFormErrors = Partial<Record<"name" | "email", string>>;

/* =========================================================
   CONSTANTS
========================================================= */

const TEAM_QUERY_KEY = ["team-members"];
const MEMBERS_PER_PAGE = 10;

const emptyForm: TeamForm = {
  name: "",
  email: "",
  role: "Member",
  department: "",
  avatar: "",
  status: "Active",
};

/* =========================================================
   TOAST
========================================================= */

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
            {toast.type === "success"
              ? "Success"
              : "Error"}
          </p>

          <p className="mt-0.5 text-sm text-slate-500">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(date: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRoleLabel(role: UserRole | null) {
  if (role === "Employee") {
    return "Employee";
  }

  return role ?? "Employee";
}

/* =========================================================
   MAIN
========================================================= */

export default function Teams() {
  const queryClient = useQueryClient();

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState<TeamMember | null>(null);

  const [form, setForm] =
    useState<TeamForm>(emptyForm);

  const [formErrors, setFormErrors] =
    useState<TeamFormErrors>({});

  const [toast, setToast] =
    useState<ToastState | null>(null);

  /* =======================================================
     ROLE / PERMISSIONS
  ======================================================= */

  const userRole = getUserRole();

  const roleLabel = getRoleLabel(userRole);

  const canViewTeam = can("viewTeam");

  const canManageTeam = can("manageTeam");

  const canCreateMember = can("manageTeam");

  const canEditMember = can("manageTeam");

  const canDeleteMember = can("manageTeam");

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = useCallback((
    type: ToastType,
    message: string
  ) => {
    setToast({
      type,
      message,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  /* =======================================================
     TEAM QUERY
  ======================================================= */

  const {
    data: members = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<TeamMember[]>({
    queryKey: TEAM_QUERY_KEY,
    queryFn: getTeamMembers,
    enabled: canViewTeam,
    staleTime: 30_000,
  });

  /* =======================================================
     CREATE MEMBER MUTATION
  ======================================================= */

  const createMutation = useMutation({
    mutationFn: (
      payload: CreateTeamMemberRequest
    ) => createTeamMember(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEY,
      });

      showToast(
        "success",
        "Team member added successfully."
      );

      closeModal();
    },

    onError: (err: unknown) => {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      showToast(
        "error",
        message ||
        "Failed to add team member."
      );
    },
  });

  /* =======================================================
     UPDATE MEMBER MUTATION
  ======================================================= */

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateTeamMemberRequest;
    }) =>
      updateTeamMember(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEY,
      });

      showToast(
        "success",
        "Team member updated successfully."
      );

      closeModal();
    },

    onError: (err: unknown) => {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      showToast("error", message || "Failed to update team member.");
    },
  });

  /* =======================================================
     DELETE MEMBER MUTATION
  ======================================================= */

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteTeamMember(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEY,
      });

      showToast(
        "success",
        "Team member deleted successfully."
      );
    },

    onError: (err: unknown) => {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      showToast("error", message || "Failed to delete team member.");
    },
  });

  const createTeamMemberRequest = createMutation.mutate;
  const updateTeamMemberRequest = updateMutation.mutate;
  const deleteTeamMemberRequest = deleteMutation.mutate;

  /* =======================================================
     MUTATION LOADING
  ======================================================= */

  const saving =
    createMutation.isPending ||
    updateMutation.isPending;

  /* =======================================================
     DEPARTMENTS
  ======================================================= */

  const departments = useMemo(() => {
    const values = members
      .map((member) => member.department)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [members]);

  /* =======================================================
     FILTERED MEMBERS
  ======================================================= */

  const filteredMembers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        member.name
          .toLowerCase()
          .includes(query) ||
        member.email
          .toLowerCase()
          .includes(query) ||
        member.role
          .toLowerCase()
          .includes(query) ||
        member.department
          .toLowerCase()
          .includes(query);

      const matchesDepartment =
        departmentFilter === "All" ||
        member.department ===
          departmentFilter;

      const matchesStatus =
        statusFilter === "All" ||
        member.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    members,
    search,
    departmentFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE),
  );
  const activePage = Math.min(currentPage, totalPages);
  const paginatedMembers = useMemo(
    () =>
      filteredMembers.slice(
        (activePage - 1) * MEMBERS_PER_PAGE,
        activePage * MEMBERS_PER_PAGE,
      ),
    [activePage, filteredMembers],
  );

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const active = members.filter(
      (member) =>
        member.status?.toLowerCase() ===
        "active"
    ).length;

    const inactive = members.filter(
      (member) =>
        member.status?.toLowerCase() !==
        "active"
    ).length;

    const departmentsCount =
      new Set(
        members
          .map(
            (member) =>
              member.department
          )
          .filter(Boolean)
      ).size;

    return {
      total: members.length,
      active,
      inactive,
      departments: departmentsCount,
    };
  }, [members]);

  /* =======================================================
     MODAL
  ======================================================= */

  const openCreateModal = useCallback(() => {
    if (!canCreateMember) {
      showToast(
        "error",
        "You do not have permission to add team members."
      );
      return;
    }

    setEditingMember(null);

    setForm({
      ...emptyForm,
    });
    setFormErrors({});

    setShowModal(true);
  }, [canCreateMember, showToast]);

  const openEditModal = useCallback((
    member: TeamMember
  ) => {
    if (!canEditMember) {
      showToast(
        "error",
        "You do not have permission to edit team members."
      );
      return;
    }

    setEditingMember(member);

    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      avatar: member.avatar,
      status: member.status,
    });
    setFormErrors({});

    setShowModal(true);
  }, [canEditMember, showToast]);

  const closeModal = useCallback(() => {
    if (saving) return;

    setShowModal(false);
    setEditingMember(null);

    setForm({
      ...emptyForm,
    });
    setFormErrors({});
  }, [saving]);

  const handleFormChange = useCallback((
    field: keyof TeamForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "name" || field === "email") {
      const isEmpty = !value.trim();
      const error = field === "name"
        ? "Team member name is required."
        : "Email is required.";

      setFormErrors((current) => ({
        ...current,
        [field]: isEmpty
          ? error
          : field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
            ? "Enter a valid email address."
            : undefined,
      }));
    }
  }, []);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = useCallback((
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!canManageTeam) {
      showToast(
        "error",
        "You do not have permission to manage the team."
      );
      return;
    }

    const errors: TeamFormErrors = {};
    if (!form.name.trim()) {
      errors.name = "Team member name is required.";
    }
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload: CreateTeamMemberRequest = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      department:
        form.department.trim(),
      avatar: form.avatar.trim(),
      status: form.status,
    };

    /* UPDATE */

    if (editingMember) {
      updateTeamMemberRequest({
        id: editingMember.id,
        payload,
      });

      return;
    }

    /* CREATE */

    createTeamMemberRequest(payload);
  }, [
    canManageTeam,
    createTeamMemberRequest,
    editingMember,
    form,
    showToast,
    updateTeamMemberRequest,
  ]);

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = useCallback((
    member: TeamMember
  ) => {
    if (!canDeleteMember) {
      showToast(
        "error",
        "You do not have permission to delete team members."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${member.name} from the team?`
      );

    if (!confirmed) {
      return;
    }

    deleteTeamMemberRequest(member.id);
  }, [canDeleteMember, deleteTeamMemberRequest, showToast]);

  /* =======================================================
     ACCESS DENIED
  ======================================================= */

  if (!canViewTeam) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={30} />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Access Restricted
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your current role does not have
              permission to view the team.
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

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50 p-6">

      {/* TOAST */}

      {toast && (
        <Toast
          toast={toast}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} />

            <span>
              Workspace
            </span>

            <span>/</span>

            <span className="text-slate-700">
              Teams
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Team
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                userRole === "Admin"
                  ? "bg-purple-50 text-purple-700"
                  : userRole === "Manager"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {roleLabel}
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            {canManageTeam
              ? "Manage your team members and responsibilities."
              : "View your team members and workspace structure."}
          </p>

        </div>

        <div className="flex gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          {/* ADD */}

          {canCreateMember && (
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />

              Add Member
            </button>
          )}

        </div>

      </div>

      {/* ===================================================
          VIEW ONLY NOTICE
      =================================================== */}

      {!canManageTeam && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">

          <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
            <Users size={18} />
          </div>

          <div>

            <p className="text-sm font-semibold text-blue-900">
              View-only team access
            </p>

            <p className="mt-0.5 text-sm text-blue-700">
              As an Employee, you can view team
              members but you cannot add, edit,
              or delete members.
            </p>

          </div>

        </div>
      )}

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <div className="inline-flex rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <Users size={20} />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Total Members
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.total}
          </p>

        </div>

        {/* ACTIVE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Active Members
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.active}
          </p>

        </div>

        {/* INACTIVE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <div className="inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <UserPlus size={20} />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Inactive Members
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.inactive}
          </p>

        </div>

        {/* DEPARTMENTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <div className="inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Users size={20} />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Departments
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.departments}
          </p>

        </div>

      </div>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, role..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />

          </div>

          <select
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(
                event.target.value
              );
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            {departments.map(
              (department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department === "All"
                    ? "All Departments"
                    : department}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              );
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

        </div>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {isError && !isLoading && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-center gap-3">

            <AlertCircle
              size={20}
              className="text-red-600"
            />

            <div>

              <p className="text-sm font-semibold text-red-900">
                Failed to load team
              </p>

              <p className="text-sm text-red-700">
                {(isAxiosError<{ message?: string }>(error)
                  ? error.response?.data?.message
                  : undefined) ||
                  (error instanceof Error
                    ? error.message
                    : "Unable to load team members.")}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
          >
            Retry
          </button>

        </div>
      )}

      {/* ===================================================
          TABLE
      =================================================== */}

      {isLoading ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="animate-pulse">

            <div className="h-14 border-b border-slate-200 bg-slate-50" />

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-20 border-b border-slate-100"
                />
              )
            )}

          </div>

        </div>
      ) : filteredMembers.length === 0 ? (

        /* EMPTY */

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Users size={26} />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            {members.length === 0
              ? "No team members yet"
              : "No members found"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {members.length === 0
              ? "Start building your team by adding your first member."
              : "Try changing your search or filters."}
          </p>

          {members.length === 0 &&
            canCreateMember && (
              <button
                type="button"
                onClick={
                  openCreateModal
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={18} />

                Add Member
              </button>
            )}

        </div>
      ) : (

        /* TABLE */

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Member
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Joined
                  </th>

                  {canManageTeam && (
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  )}

                </tr>

              </thead>

              <tbody>

                {paginatedMembers.map(
                  (member) => (
                    <tr
                      key={member.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >

                      {/* MEMBER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                              {getInitials(
                                member.name
                              )}
                            </div>
                          )}

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-900">
                              {member.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              Team Member
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <Mail
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span>
                            {member.email}
                          </span>

                        </div>

                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {member.role}
                        </span>

                      </td>

                      {/* DEPARTMENT */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-slate-600">
                          {member.department ||
                            "General"}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            member.status?.toLowerCase() ===
                            "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.status?.toLowerCase() ===
                              "active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {member.status}

                        </span>

                      </td>

                      {/* JOINED */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          member.joinedAt
                        )}
                      </td>

                      {/* ACTIONS */}

                      {canManageTeam && (
                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            {canEditMember && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    member
                                  )
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                title="Edit member"
                              >
                                <Edit3
                                  size={16}
                                />
                              </button>
                            )}

                            {canDeleteMember && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    member
                                  )
                                }
                                disabled={
                                  deleteMutation.isPending
                                }
                                className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                title="Delete member"
                              >
                                {deleteMutation.isPending &&
                                deleteMutation.variables ===
                                  member.id ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={16}
                                  />
                                )}
                              </button>
                            )}

                          </div>

                        </td>
                      )}

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">

            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(activePage - 1) * MEMBERS_PER_PAGE + 1}
                {"-"}
                {Math.min(
                  activePage * MEMBERS_PER_PAGE,
                  filteredMembers.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {members.length}
              </span>{" "}
              members
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Updating...
                </div>
              )}

              <nav
                className="flex items-center gap-2"
                aria-label="Team member pagination"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(activePage - 1)
                  }
                  disabled={activePage === 1}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                <span
                  className="whitespace-nowrap text-xs font-medium text-slate-600"
                  aria-live="polite"
                >
                  Page {activePage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(activePage + 1)
                  }
                  disabled={activePage === totalPages}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      {showModal &&
        canManageTeam && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {editingMember
                      ? "Edit Team Member"
                      : "Add Team Member"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {editingMember
                      ? "Update team member information."
                      : "Add a new member to your team."}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X size={20} />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5 p-6"
              >

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* NAME */}

                  <div>

                    <label htmlFor="team-member-name" className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name *
                    </label>

                    <input
                      id="team-member-name"
                      value={form.name}
                      onChange={(event) =>
                        handleFormChange("name", event.target.value)
                      }
                      placeholder="John Doe"
                      disabled={saving}
                      aria-invalid={Boolean(formErrors.name)}
                      aria-describedby={formErrors.name ? "team-member-name-error" : undefined}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none disabled:bg-slate-50 ${
                        formErrors.name
                          ? "border-red-400 focus:border-red-500"
                          : "border-slate-200 focus:border-slate-400"
                      }`}
                    />
                    {formErrors.name && (
                      <p id="team-member-name-error" className="mt-1.5 text-xs text-red-600">
                        {formErrors.name}
                      </p>
                    )}

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label htmlFor="team-member-email" className="mb-2 block text-sm font-semibold text-slate-700">
                      Email *
                    </label>

                    <input
                      id="team-member-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        handleFormChange("email", event.target.value)
                      }
                      placeholder="john@example.com"
                      disabled={saving}
                      aria-invalid={Boolean(formErrors.email)}
                      aria-describedby={formErrors.email ? "team-member-email-error" : undefined}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none disabled:bg-slate-50 ${
                        formErrors.email
                          ? "border-red-400 focus:border-red-500"
                          : "border-slate-200 focus:border-slate-400"
                      }`}
                    />
                    {formErrors.email && (
                      <p id="team-member-email-error" className="mt-1.5 text-xs text-red-600">
                        {formErrors.email}
                      </p>
                    )}

                  </div>

                  {/* ROLE */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Role
                    </label>

                    <select
                      value={form.role}
                      onChange={(event) =>
                        handleFormChange("role", event.target.value)
                      }
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                    >
                      <option value="Member">
                        Member
                      </option>

                      <option value="Developer">
                        Developer
                      </option>

                      <option value="Designer">
                        Designer
                      </option>

                      <option value="Manager">
                        Manager
                      </option>

                      <option value="Product Manager">
                        Product Manager
                      </option>

                      <option value="Project Manager">
                        Project Manager
                      </option>

                      <option value="QA Engineer">
                        QA Engineer
                      </option>

                      <option value="Admin">
                        Admin
                      </option>
                    </select>

                  </div>

                  {/* DEPARTMENT */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Department
                    </label>

                    <input
                      value={form.department}
                      onChange={(event) =>
                        handleFormChange("department", event.target.value)
                      }
                      placeholder="Engineering"
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                    />

                  </div>

                  {/* STATUS */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        handleFormChange("status", event.target.value)
                      }
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>

                  </div>

                  {/* AVATAR */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Avatar URL
                    </label>

                    <input
                      value={form.avatar}
                      onChange={(event) =>
                        handleFormChange("avatar", event.target.value)
                      }
                      placeholder="https://..."
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                    />

                  </div>

                </div>

                {/* PERMISSION INFO */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Team permissions
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-purple-700">
                        Admin
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Full team management
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-blue-700">
                        Manager
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Manage team members
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-slate-700">
                        Employee
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        View team only
                      </p>
                    </div>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Check size={17} />
                    )}

                    {saving
                      ? "Saving..."
                      : editingMember
                      ? "Update Member"
                      : "Add Member"}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}