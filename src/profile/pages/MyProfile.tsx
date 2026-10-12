import { useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/useAuthContext";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";

const profileRoles = new Set(["Admin", "Manager", "Developer", "Employee"]);

export default function MyProfile() {
  const { user, updateUserName } = useAuthContext();
  const canAccessOwnProfile = Boolean(user && profileRoles.has(user.role));
  const { data: profile, isLoading, error, refetch } =
    useProfile(canAccessOwnProfile);
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    try {
      const updatedProfile = await updateProfile.mutateAsync({
        name: trimmedName,
      });
      setName(updatedProfile.name);
      updateUserName(updatedProfile.name);
      setIsEditing(false);
      toast.success("Your profile has been updated.");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update your profile.",
      );
    }
  }

  if (!canAccessOwnProfile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
        >
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">Profile access unavailable</p>
            <p className="mt-1 text-sm">
              Sign in with an Admin, Manager, or Employee account to manage
              your own profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
        <LoaderCircle className="animate-spin" size={22} />
        Loading your profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <div className="flex-1">
            <p className="font-semibold">Unable to load your profile</p>
            <p className="mt-1 text-sm">
              Your account information could not be retrieved.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayRole =
    profile.role === "Developer" ? "Employee" : profile.role;

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-medium text-indigo-600">
            Account
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View and manage your personal account information.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-indigo-600 to-violet-500" />
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700">
                  {initials || <UserRound size={30} />}
                </div>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {profile.email}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
                {displayRole}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Personal information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update your display name and review your account details.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setName(profile.name);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="profile-name"
                    value={isEditing ? name : profile.name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={!isEditing || updateProfile.isPending}
                    required
                    minLength={2}
                    maxLength={100}
                    className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="profile-email"
                    value={profile.email}
                    readOnly
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-500"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Contact your administrator if your email needs to change.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <input
                  value={displayRole}
                  readOnly
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Account status
                </label>
                <div className="flex h-11 items-center">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                    profile.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    <span className={`size-2 rounded-full ${
                      profile.isActive ? "bg-emerald-500" : "bg-slate-400"
                    }`} />
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setName(profile.name);
                    setIsEditing(false);
                  }}
                  disabled={updateProfile.isPending}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    updateProfile.isPending ||
                    name.trim().length < 2 ||
                    name.trim() === profile.name
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateProfile.isPending && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  Save changes
                </button>
              </div>
            )}
          </form>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              Account security
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Keep your account secure. Use the password reset flow if you
              need to recover access to your account.
            </p>
            <a
              href="/forget-password"
              className="mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Reset password
            </a>
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-600">
            <ShieldCheck size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              Your profile access
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {displayRole} accounts can view and update their own profile.
              You cannot view or edit another user’s profile from this page.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}