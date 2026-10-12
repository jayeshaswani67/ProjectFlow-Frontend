import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  Search,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Users as UsersIcon,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  useAdminUsers,
} from "../../admin/hooks/useAdminUsers.ts";

import type {
  CreateUserRequest,
  JobRole,
  UpdateUserRequest,
  User,
  UserStatus,
} from "../api/userApi";

const JOB_ROLES: JobRole[] = [
  "Developer",
  "Designer",
  "Marketer",
  "Video Editor",
];

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Media",
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "Employee" as "Manager" | "Employee",
  jobRole: "Developer" as JobRole,
  department: "Engineering",
  status: "Active" as UserStatus,
};

type FormState = typeof initialForm;

export function Users() {
  const {
    users,
    isLoading,
    isError,
    error,
    refetch,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
  } = useAdminUsers();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<"All" | "Manager" | "Employee">("All");

  const [statusFilter, setStatusFilter] =
    useState<"All" | UserStatus>("All");

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const isSaving =
    isCreating || isUpdating;

  const teamLeadCount = users.filter(
    (user) => user.role === "Manager",
  ).length;
  const employeeCount = users.filter(
    (user) => user.role === "Employee",
  ).length;
  const activeCount = users.filter(
    (user) => user.status === "Active",
  ).length;
  const inactiveCount = users.length - activeCount;
  const hasFilters =
    search.trim().length > 0 ||
    roleFilter !== "All" ||
    statusFilter !== "All";

  const filteredUsers = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.name
          .toLowerCase()
          .includes(searchValue) ||
        user.email
          .toLowerCase()
          .includes(searchValue) ||
        user.role
          .toLowerCase()
          .includes(searchValue) ||
        user.jobRole
          .toLowerCase()
          .includes(searchValue) ||
        user.department
          .toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const openAddModal = () => {
    setEditingUser(null);

    setForm({
      ...initialForm,
      password: "",
    });

    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role:
        user.role === "Manager"
          ? "Manager"
          : "Employee",
      jobRole: user.jobRole,
      department: user.department,
      status: user.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    setShowModal(false);
    setEditingUser(null);
    setForm({
      ...initialForm,
      password: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!editingUser && form.password.length < 8) {
      toast.error(
        "Password must be at least 8 characters"
      );
      return;
    }

    try {
      if (editingUser) {
        const payload: UpdateUserRequest = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          jobRole: form.jobRole,
          department: form.department,
          status: form.status,
        };

        await updateUser({
          id: editingUser.id,
          data: payload,
        });

        toast.success(
          "User updated successfully"
        );
      } else {
        const payload: CreateUserRequest = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          jobRole: form.jobRole,
          department: form.department,
          status: form.status,
        };

        await createUser(payload);

        toast.success(
          "User created successfully"
        );
      }

      closeModal();
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save user"
      );
    }
  };

  const handleStatusToggle = async (
    user: User
  ) => {
    const newStatus: UserStatus =
      user.status === "Active"
        ? "Inactive"
        : "Active";

    try {
      await updateUserStatus({
        id: user.id,
        status: newStatus,
      });

      toast.success(
        newStatus === "Active"
          ? "User activated"
          : "User deactivated"
      );
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update user status"
      );
    }
  };

  const handleDelete = async (
    user: User
  ) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteUser(user.id);

      toast.success(
        "User deleted successfully"
      );
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete user"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2.5 text-white">
              <UsersIcon size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Users
              </h1>

              <p className="text-sm text-slate-500">
                Manage managers and employees
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 md:w-auto"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* USER TOTALS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Team Leads
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {isLoading || isError ? "—" : teamLeadCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <UsersIcon size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Employees
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {isLoading || isError ? "—" : employeeCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Active accounts
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {isLoading || isError ? "—" : activeCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Inactive accounts
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {isLoading || isError ? "—" : inactiveCount}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              aria-label="Search users"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search name, email, role, department..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          <select
            aria-label="Filter users by system role"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value as
                | "All"
                | "Manager"
                | "Employee"
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"
          >
            <option value="All">
              All system roles
            </option>

            <option value="Manager">
              Managers
            </option>

            <option value="Employee">
              Employees
            </option>
          </select>

          <select
            aria-label="Filter users by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                | "All"
                | UserStatus
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"
          >
            <option value="All">
              All statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {users.length}
            </span>{" "}
            users
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("All");
                setStatusFilter("All");
              }}
              className="w-fit font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2
              className="animate-spin text-slate-500"
              size={28}
            />
          </div>
        ) : isError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-red-50 p-4 text-red-600">
              <UsersIcon size={28} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Unable to load users
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              {error instanceof Error
                ? error.message
                : "Check your API and authentication, then try again."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <UsersIcon
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters ? "No matching users" : "No users yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasFilters
                ? "Try a different search or clear your filters."
                : "Add a manager or employee to get started."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("All");
                  setStatusFilter("All");
                }}
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredUsers.map((user) => (
              <article key={user.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {user.name}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      user.status === "Active"
                        ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                        : "shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
                    }
                  >
                    {user.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-slate-400">
                      System role
                    </dt>
                    <dd className="mt-1 font-medium text-slate-700">
                      {user.role}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-400">
                      Job role
                    </dt>
                    <dd className="mt-1 font-medium text-slate-700">
                      {user.jobRole}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-slate-400">
                      Department
                    </dt>
                    <dd className="mt-1 font-medium text-slate-700">
                      {user.department || "—"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(user)}
                    aria-label={`Edit ${user.name}`}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusToggle(user)}
                    aria-label={`${user.status === "Active" ? "Deactivate" : "Activate"} ${user.name}`}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                  >
                    {user.status === "Active" ? (
                      <UserX size={17} />
                    ) : (
                      <UserCheck size={17} />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDelete(user)}
                    aria-label={`Delete ${user.name}`}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    System Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Job Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-700">
                          {user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {user.role ===
                          "Employee"
                          ? "Employee"
                          : user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.jobRole}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.department || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          user.status ===
                            "Active"
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
                        }
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(user)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Edit"
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          disabled={
                            isUpdatingStatus
                          }
                          onClick={() =>
                            handleStatusToggle(
                              user
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                          title={
                            user.status ===
                              "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          aria-label={`${user.status === "Active" ? "Deactivate" : "Activate"} ${user.name}`}
                        >
                          {user.status ===
                            "Active" ? (
                            <UserX
                              size={17}
                            />
                          ) : (
                            <UserCheck
                              size={17}
                            />
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            handleDelete(user)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Delete"
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser
                    ? "Edit User"
                    : "Add User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingUser
                    ? "Update account and role information."
                    : "Create a manager or employee account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@company.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {!editingUser && (
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Temporary Password
                    </label>

                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-11 text-sm outline-none focus:border-slate-400"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        title={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Give this password to the new user. They can
                      change it later.
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    System Role
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="Manager">
                      Manager
                    </option>

                    <option value="Employee">
                      Employee
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Job Role
                  </label>

                  <select
                    name="jobRole"
                    value={form.jobRole}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    {JOB_ROLES.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    {DEPARTMENTS.map(
                      (department) => (
                        <option
                          key={department}
                          value={department}
                        >
                          {department}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSaving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingUser
                    ? "Save Changes"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}