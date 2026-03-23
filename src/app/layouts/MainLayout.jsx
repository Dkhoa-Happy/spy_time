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
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-cyan-300/8 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-950/40 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[96rem] flex-col gap-8 rounded-[1.4rem] border border-border/70 bg-surface/82 p-6 shadow-[0_24px_70px_rgb(0_0_0_/_0.34)] backdrop-blur-xl md:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Coordinator Console
            </p>
            <h1 className="tracking-tighter text-3xl 6font-bold text-foreground">
              Spy Time Control Room
            </h1>
          </div>
          <nav className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/55 p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]">
            <NavLink to={ROUTES.home} className={navLinkClass} end>
              Briefing
            </NavLink>
            <NavLink to={ROUTES.stage1930} className={navLinkClass}>
              Rooms
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
