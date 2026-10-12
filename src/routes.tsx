import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";


// Layout
import AppLayout from "./components/AppLayout";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";


// Pages
import MyProfile from "./profile/pages/MyProfile";
import Projects from "./projects/pages/Projects";
import Tasks from "./tasks/pages/Tasks";
import SettingsPage from "./admin/pages/Settings.tsx";
import { Users as UsersPage } from "./admin/pages/Users.tsx";
import Analytics from "./admin/pages/Analytics.tsx";
import ForgetPassword from "./auth/pages/Forget-password.tsx";
import ResetPassword from "./auth/pages/Reset-password.tsx";
import AIPlanner from "./pages/AIPlanner.tsx";
import Teams from "./teams/pages/Teams.tsx";
import Login from "./auth/pages/Login.tsx";
import WorkReview from "./features/work-submission/pages/WorkReview.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ManagerDashboard from "./pages/ManagerDashboard.tsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.tsx";
import MyProjects from "./pages/MyProjects.tsx";
import MyTasks from "./pages/MyTasks.tsx";
import { getUserRole, type UserRole } from "./utils/permission";

function DashboardRedirect() {
  const role = getUserRole();

  if (role === "Admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (role === "Manager") {
    return <Navigate to="/manager-dashboard" replace />;
  }

  if (role === "Employee") {
    return <Navigate to="/employee-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function RoleDashboard({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  return getUserRole() === role
    ? children
    : <DashboardRedirect />;
}

function EmployeeOnlyRoute({ children }: { children: ReactNode }) {
  return getUserRole() === "Employee"
    ? children
    : <DashboardRedirect />;
}



export const router = createBrowserRouter([

  // PUBLIC ROUTES


  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },


  // PROTECTED ROUTES
  
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardRedirect />,
          },

          // Role-specific dashboards
          {
            path: "/admin-dashboard",
            element: (
              <RoleDashboard role="Admin">
                <AdminDashboard />
              </RoleDashboard>
            ),
          },
          {
            path: "/manager-dashboard",
            element: (
              <RoleDashboard role="Manager">
                <ManagerDashboard />
              </RoleDashboard>
            ),
          },
          {
            path: "/employee-dashboard",
            element: (
              <RoleDashboard role="Employee">
                <EmployeeDashboard />
              </RoleDashboard>
            ),
          },

          // Projects
          {
            path: "/projects",
            element: <Projects />,
          },
          {
            path: "/my-projects",
            element: (
              <EmployeeOnlyRoute>
                <MyProjects />
              </EmployeeOnlyRoute>
            ),
          },

          // Tasks
          {
            path: "/tasks",
            element: <Tasks />,
          },
          {
            path: "/my-tasks",
            element: (
              <EmployeeOnlyRoute>
                <MyTasks />
              </EmployeeOnlyRoute>
            ),
          },

          // Teams
          {
            path: "/teams",
            element: <Teams />,
          },

          // AI Planner
          {
            path: "/aiplanner",
            element: <AIPlanner />,
          },

          // Analytics
          {
            path: "/analytics",
            element: <Analytics />,
          },

          // Settings
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/work-review",
            element: <WorkReview />,
          },
          {
            path: "/profile",
            element: <MyProfile />,
          },

          // =================================================
          // ADMIN ROUTES
          // =================================================

          {
            element: <AdminRoute />,
            children: [
              {
                path: "/users",
                element: <UsersPage />,
              },
            ],
          },
        ],
      },
    ],
  },


  // DEFAULT ROUTES


  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);