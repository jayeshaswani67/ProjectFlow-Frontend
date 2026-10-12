import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  ClipboardCheck,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import { can, type Permission } from "../utils/permission";
import { deleteCookie } from "../utils/cookies";
import { getCurrentRole as getTokenRole } from "../services/auth/permissionService";

interface SidebarProps {
  onNavigate?: (item: string) => void;
}

type Role =
  | "Admin"
  | "Manager"
  | "Developer";

interface NavigationItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  permission: Permission;
}

interface NavigationGroup {
  section: string;
  items: NavigationItem[];
}

/*
|--------------------------------------------------------------------------
| ADMIN NAVIGATION
|--------------------------------------------------------------------------
*/

const adminNavigation: NavigationGroup[] = [
  {
    section: "Workspace",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin-dashboard",
        permission: "viewDashboard",
      },

      {
        label: "Projects",
        icon: FolderKanban,
        path: "/projects",
        permission: "viewProjects",
      },

      {
        label: "Tasks",
        icon: CheckSquare,
        path: "/tasks",
        permission: "viewTasks",
      },

      {
        label: "Teams",
        icon: Users,
        path: "/teams",
        permission: "viewTeam",
      },

      {
        label: "Analytics",
        icon: BarChart3,
        path: "/analytics",
        permission: "viewAnalytics",
      },
    ],
  },

  {
    section: "Administration",
    items: [
      {
        label: "Users",
        icon: ShieldCheck,
        path: "/users",
        permission: "manageUsers",
      },

      {
        label: "Settings",
        icon: Settings,
        path: "/settings",
        permission: "systemSettings",
      },
    ],
  },
];

/*
|--------------------------------------------------------------------------
| MANAGER NAVIGATION
|--------------------------------------------------------------------------
*/

const managerNavigation: NavigationGroup[] = [
  {
    section: "Workspace",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/manager-dashboard",
        permission: "viewDashboard",
      },

      {
        label: "Projects",
        icon: FolderKanban,
        path: "/projects",
        permission: "viewProjects",
      },

      {
        label: "Tasks",
        icon: CheckSquare,
        path: "/tasks",
        permission: "viewTasks",
      },

      {
        label: "Teams",
        icon: Users,
        path: "/teams",
        permission: "viewTeam",
      },

    ],
  },

  {
    section: "Management",
    items: [
      {
        label: "Work Review",
        icon: ClipboardCheck,
        path: "/work-review",
        permission: "reviewWork",
      },
    ],
  },
];

/*
|--------------------------------------------------------------------------
| EMPLOYEE NAVIGATION
|--------------------------------------------------------------------------
*/

const employeeNavigation: NavigationGroup[] = [
  {
    section: "My Workspace",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/employee-dashboard",
        permission: "viewDashboard",
      },

      {
        label: "My Projects",
        icon: FolderKanban,
        path: "/my-projects",
        permission: "viewProjects",
      },

      {
        label: "My Tasks",
        icon: CheckSquare,
        path: "/my-tasks",
        permission: "viewTasks",
      },
    ],
  },
];

/*
|--------------------------------------------------------------------------
| GET CURRENT ROLE
|--------------------------------------------------------------------------
*/

const roleByClaim: Record<string, Role> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Developer",
  developer: "Developer",
};

/*
|--------------------------------------------------------------------------
| GET NAVIGATION FOR ROLE
|--------------------------------------------------------------------------
*/

const getNavigationForRole = (
  role: Role | null,
): NavigationGroup[] => {
  switch (role) {
    case "Admin":
      return adminNavigation;

    case "Manager":
      return managerNavigation;

    case "Developer":
      return employeeNavigation;

    default:
      return [];
  }
};

/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

export default function Sidebar({
  onNavigate,
}: SidebarProps) {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const roleClaim = getTokenRole()?.toLowerCase();
  const role = roleClaim ? roleByClaim[roleClaim] ?? null : null;

  const navigation =
    getNavigationForRole(role);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* =====================================================
          MOBILE OPEN BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setMobileOpen(true)
        }
        className="fixed left-4 top-4 z-30 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden"
        aria-label="Open navigation"
      >
        <LayoutDashboard size={20} />
      </button>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          z-50
          flex h-screen min-h-screen shrink-0 flex-col
          border-r border-slate-200
          bg-white
          transition-all duration-300

          lg:sticky
          lg:top-0
          lg:self-start

          ${
            collapsed
              ? "w-[78px]"
              : "w-[260px]"
          }

          ${
            mobileOpen
              ? "fixed left-0 top-0 translate-x-0"
              : "fixed left-0 top-0 -translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className={`
            flex h-[72px]
            items-center
            border-b border-slate-100

            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              P
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-[17px] font-bold tracking-tight text-slate-900">
                  ProjectFlow
                </h1>

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {role ?? "Workspace"}
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {navigation.map((group) => {
            /*
             * Role decides which navigation set
             * is available.
             *
             * Permission decides whether the
             * individual item is allowed.
             */

            const visibleItems = group.items.filter((item) =>
              role === "Developer" || can(item.permission),
            );

            if (
              visibleItems.length === 0
            ) {
              return null;
            }

            return (
              <div
                key={group.section}
                className="mb-7"
              >
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {group.section}
                  </p>
                )}

                <div className="space-y-1">
                  {visibleItems.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            onNavigate?.(
                              item.label,
                            );

                            setMobileOpen(
                              false,
                            );
                          }}
                          title={
                            collapsed
                              ? item.label
                              : undefined
                          }
                          className={({
                            isActive,
                          }) =>
                            `
                            group flex w-full
                            items-center gap-3
                            rounded-xl
                            px-3 py-2.5
                            text-sm font-medium
                            transition-all

                            ${
                              collapsed
                                ? "justify-center"
                                : "justify-start"
                            }

                            ${
                              isActive
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }
                            `
                          }
                        >
                          {({
                            isActive,
                          }) => (
                            <>
                              <Icon
                                size={19}
                                strokeWidth={
                                  isActive
                                    ? 2.3
                                    : 2
                                }
                                className={
                                  isActive
                                    ? "text-slate-900"
                                    : "text-slate-400 group-hover:text-slate-700"
                                }
                              />

                              {!collapsed && (
                                <span className="flex-1 text-left">
                                  {
                                    item.label
                                  }
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    },
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* =====================================================
            BOTTOM
        ===================================================== */}

        <div className="border-t border-slate-100 p-3">
          {/* Collapse */}

          <button
            type="button"
            onClick={() =>
              setCollapsed(
                (value) => !value,
              )
            }
            className={`
              mb-2 flex w-full
              items-center
              rounded-xl
              px-3 py-2.5
              text-sm
              text-slate-500
              transition
              hover:bg-slate-50
              hover:text-slate-900

              ${
                collapsed
                  ? "justify-center"
                  : "justify-start gap-3"
              }
            `}
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <ChevronRight
                size={18}
              />
            ) : (
              <>
                <ChevronLeft
                  size={18}
                />

                <span>
                  Collapse
                </span>
              </>
            )}
          </button>

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className={`
              flex w-full
              items-center
              rounded-xl
              px-3 py-2.5
              text-sm
              font-medium
              text-slate-500
              transition

              hover:bg-red-50
              hover:text-red-600

              ${
                collapsed
                  ? "justify-center"
                  : "justify-start gap-3"
              }
            `}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
          >
            <LogOut size={18} />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}