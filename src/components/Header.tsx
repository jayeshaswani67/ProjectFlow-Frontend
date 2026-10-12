
import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  User,
  Shield,
  Lock,
  LogOut,
  X,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useNotifications } from "../context/useNotifications";

import api from "../lib/axios";
import { useAuthContext } from "../context/useAuthContext";
import { getUserRole } from "../utils/permission";

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({
  title = "Dashboard",
  description = "Welcome back to ProjectFlow",
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAllAsRead,
  } = useNotifications();
  const { user, logoutUser } = useAuthContext();
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const employee = getUserRole() === "Employee";
  const openNotification = (
    actionUrl: string | null | undefined,
    type: string,
  ) => {
    setNotificationsOpen(false);

    if (actionUrl?.startsWith("/") && !actionUrl.startsWith("//")) {
      navigate(actionUrl);
      return;
    }

    navigate(
      type.startsWith("PROJECT_")
        ? employee
          ? "/my-projects"
          : "/projects"
        : employee
          ? "/my-tasks"
          : "/tasks",
    );
  };


  // CLOSE PROFILE WHEN CLICKING OUTSIDE


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  // USER INFO


  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userRole = user?.role || "Developer";

  const initials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();


  // LOGOUT


  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };


  // OPEN CHANGE PASSWORD


  const handleChangePassword = () => {
    setProfileOpen(false);
    setChangePasswordOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200 bg-white/95 px-4 pl-16 backdrop-blur md:pl-16 md:pr-6 lg:px-8">

        {/* 
            LEFT SECTION
         */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">
              {title}
            </h1>
          </div>

          <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
            {description}
          </p>
        </div>

        {/* 
            RIGHT SECTION
         */}

        <div className="flex items-center gap-2 md:gap-3">


          {/* 
              NOTIFICATIONS
           */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const opening = !notificationsOpen;
                setNotificationsOpen(opening);
                if (opening) {
                  markAllAsRead();
                }
              }}
              className="
                relative flex h-9 w-9 items-center justify-center
                rounded-xl text-slate-500
                transition hover:bg-slate-100 hover:text-slate-800
              "
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute -right-1 -top-1 flex h-4 min-w-4
                    items-center justify-center rounded-full
                    bg-red-500 px-1 text-[10px] font-semibold text-white
                  "
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h2>
                </div>

                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    No notifications yet.
                  </p>
                ) : (
                  <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <li
                        key={notification.id}
                        className={
                          index < unreadCount
                            ? "bg-blue-50/60"
                            : ""
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openNotification(
                              notification.actionUrl,
                              notification.type,
                            )
                          }
                          className="w-full px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <span className="block text-xs font-medium text-slate-500">
                            {notification.title}
                          </span>
                          <span className="mt-1 block truncate text-sm font-medium text-slate-900">
                            {notification.message}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* DIVIDER */}

          <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

          {/* 
              USER MENU
           */}

          <div
            ref={profileRef}
            className="relative"
          >

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="
                flex items-center gap-2 rounded-xl
                p-1.5 pr-2
                transition hover:bg-slate-50
              "
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >

              {/* AVATAR */}

              <div
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-full bg-slate-900
                  text-[11px] font-bold text-white
                "
              >
                {initials}
              </div>

              {/* USER INFO */}

              <div className="hidden text-left lg:block">

                <p className="max-w-[110px] truncate text-xs font-semibold text-slate-800">
                  {userName}
                </p>

                <p className="text-[10px] text-slate-400">
                  {userRole}
                </p>

              </div>

              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition-transform lg:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />

            </button>

            {/* 
                PROFILE DROPDOWN
             */}

            {profileOpen && (
              <div
                className="
                  absolute right-0 top-[calc(100%+10px)]
                  z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden
                  rounded-2xl border border-slate-200
                  bg-white shadow-xl
                "
              >

                {/* PROFILE HEADER */}

                <div className="border-b border-slate-100 p-5">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex h-12 w-12 items-center
                        justify-center rounded-full
                        bg-slate-900
                        text-sm font-bold text-white
                      "
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-slate-900">
                        {userName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {userEmail}
                      </p>

                    </div>

                  </div>

                </div>

                {/* PROFILE INFORMATION */}

                <div className="p-3">

                  <div className="rounded-xl bg-slate-50 p-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                        <Shield
                          size={17}
                          className="text-slate-600"
                        />
                      </div>

                      <div>

                        <p className="text-[11px] text-slate-400">
                          Account role
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          {userRole}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* MENU */}

                <div className="border-t border-slate-100 p-2">

                  {/* PROFILE */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-left text-sm text-slate-700
                      transition hover:bg-slate-50
                    "
                  >
                    <User
                      size={17}
                      className="text-slate-400"
                    />

                    <span>My Profile</span>
                  </button>

                  {/* CHANGE PASSWORD */}

                  <button
                    onClick={handleChangePassword}
                    className="
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-left text-sm text-slate-700
                      transition hover:bg-slate-50
                    "
                  >
                    <Lock
                      size={17}
                      className="text-slate-400"
                    />

                    <span>Change Password</span>
                  </button>

                  {/* LOGOUT */}

                  <button
                    onClick={handleLogout}
                    className="
                      mt-1 flex w-full items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-left text-sm text-red-600
                      transition hover:bg-red-50
                    "
                  >
                    <LogOut size={17} />

                    <span>Logout</span>
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      </header>

      {/* ==
          CHANGE PASSWORD MODAL
      == */}

      {changePasswordOpen && (
        <ChangePasswordModal
          onClose={() => setChangePasswordOpen(false)}
        />
      )}
    </>
  );
}


// ========
// CHANGE PASSWORD MODAL
// ========

function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // SUBMIT


  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (!newPassword) {
      setError("Enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setSuccess(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (error: unknown) {
      console.error(
        "Change password failed:",
        error
      );

      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ||
          "Failed to change password."
        : error instanceof Error
          ? error.message
          : "Failed to change password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/50 p-4
      "
    >

      <div
        className="
          w-full max-w-md
          overflow-hidden rounded-2xl
          bg-white shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            flex items-center justify-between
            border-b border-slate-100
            px-6 py-5
          "
        >

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Change Password
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Update your account password
            </p>

          </div>

          <button
            onClick={onClose}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg text-slate-400
              transition hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={19} />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* CURRENT PASSWORD */}

          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            setVisible={setShowCurrent}
          />

          {/* NEW PASSWORD */}

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNew}
            setVisible={setShowNew}
          />

          {/* CONFIRM PASSWORD */}

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirm}
            setVisible={setShowConfirm}
          />

          {/* ERROR */}

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-lg border border-slate-200
                px-4 py-2.5 text-sm font-medium
                text-slate-700
                transition hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex items-center gap-2
                rounded-lg bg-slate-900
                px-4 py-2.5 text-sm font-medium
                text-white
                transition hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Updating..."
                : "Change Password"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


// ========
// PASSWORD INPUT
// ========

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  setVisible,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full rounded-lg
            border border-slate-200
            px-3 py-2.5 pr-11
            text-sm text-slate-900
            outline-none
            transition
            focus:border-slate-400
            focus:ring-2
            focus:ring-slate-100
          "
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={() =>
            setVisible(!visible)
          }
          className="
            absolute right-2 top-1/2
            flex h-8 w-8
            -translate-y-1/2
            items-center justify-center
            rounded-lg text-slate-400
            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>

      </div>

    </div>
  );
}
