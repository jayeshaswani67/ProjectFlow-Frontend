import { Navigate, Outlet } from "react-router-dom";
import { isAdmin } from "../utils/permission";

export default function AdminRoute() {
  return isAdmin()
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
}
