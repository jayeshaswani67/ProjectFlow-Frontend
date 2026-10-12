import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/useAuthContext";

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;