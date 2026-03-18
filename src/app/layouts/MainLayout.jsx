import { NavLink, Outlet } from "react-router-dom";

import { ROUTES } from "../../shared/constants/routes";
import { cn } from "../../shared/lib/utils";

const navLinkClass = ({ isActive }) =>
  cn(
    "px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] transition-colors",
    isActive ? "text-brand" : "text-muted-foreground hover:text-foreground",
  );

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-xl border border-border/80 bg-white/80 p-6 shadow-xl backdrop-blur md:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Coordinator Console
            </p>
            <h1 className="tracking-tighter text-3xl font-bold text-foreground">
              Spy Time Control Room
            </h1>
          </div>
          <nav className="flex items-center gap-2 rounded-md border border-border bg-surface p-1">
            <NavLink to={ROUTES.home} className={navLinkClass} end>
              Dashboard
            </NavLink>
          </nav>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
