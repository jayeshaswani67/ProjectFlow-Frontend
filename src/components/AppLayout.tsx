import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useMediaQuery from "../hooks/useMediaQuery";

export default function AppLayout() {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery(
    "(min-width: 640px) and (max-width: 1023px)",
  );

  const contentPadding = isMobile
    ? "p-3"
    : isTablet
      ? "p-5"
      : "p-8";

  return (
    <div className="flex min-h-screen w-full bg-slate-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">

        <Header />

        <main className={`min-w-0 flex-1 overflow-x-hidden ${contentPadding}`}>
          <Outlet />
        </main>

      </div>

    </div>
  );
}