import { Flashlight } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { collectKeyword, toggleUvHunt } from "../store/slices/appSlice";
import { ROUTES } from "../../shared/constants/routes";
import { cn } from "../../shared/lib/utils";

const navLinkClass = ({ isActive }) =>
  cn(
    "px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] transition-colors",
    isActive ? "text-brand" : "text-muted-foreground hover:text-foreground",
  );

export const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });
  const game = useSelector((state) => state.app.game);
  const completedStages = game.completedStages ?? [];
  const keywordBag = game.inventory?.keywords ?? {
    khoiNguon: false,
    docLap: false,
    thongNhat: false,
    doiMoi: false,
  };
  const hasCompletedAllRooms =
    Boolean(game.missionCompleted) &&
    [1, 2, 3, 4].every((stage) => completedStages.includes(stage));
  const isInsideRoomArea = [
    ROUTES.stage1930,
    ROUTES.stage1945,
    ROUTES.stage1975,
    ROUTES.stage1986Prep,
    ROUTES.stage1986,
  ].includes(location.pathname);

  const quickRoomLinks = [
    { to: ROUTES.stage1930, label: "Room 1930" },
    { to: ROUTES.stage1945, label: "Room 1945" },
    { to: ROUTES.stage1975, label: "Room 1975" },
    { to: ROUTES.stage1986, label: "Room 1986" },
    { to: ROUTES.missionComplete, label: "Mission Accomplished" },
  ];

  const UV_HUNT_CLUES = {
    [ROUTES.stage1930]: [
      {
        id: "uv-khoi-nguon",
        keywordKey: "khoiNguon",
        text: "KHỞI NGUỒN",
        style: { left: "13%", top: "25%" },
      },
    ],
    [ROUTES.stage1945]: [
      {
        id: "uv-doc-lap",
        keywordKey: "docLap",
        text: "ĐỘC LẬP",
        style: { right: "17%", top: "28%" },
      },
    ],
    [ROUTES.stage1975]: [
      {
        id: "uv-thong-nhat",
        keywordKey: "thongNhat",
        text: "THỐNG NHẤT",
        style: { left: "44%", top: "38%" },
      },
    ],
    [ROUTES.stage1986]: [
      {
        id: "uv-doi-moi",
        keywordKey: "doiMoi",
        text: "ĐỔI MỚI",
        style: { left: "49%", top: "67%" },
      },
    ],
  };

  const routeClues = UV_HUNT_CLUES[location.pathname] ?? [];
  const showUvHuntControls = game.missionCompleted;

  const hiddenMask =
    game.uvHuntEnabled && pointer.active
      ? `radial-gradient(circle 130px at ${pointer.x}px ${pointer.y}px, black 0%, black 58%, transparent 100%)`
      : "radial-gradient(circle 0px at 0px 0px, transparent 100%, transparent 100%)";

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8"
      onMouseMove={(event) =>
        setPointer({ x: event.clientX, y: event.clientY, active: true })
      }
      onMouseLeave={() => setPointer((prev) => ({ ...prev, active: false }))}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-cyan-300/8 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-950/40 to-transparent" />
      </div>

      {showUvHuntControls && (
        <>
          <button
            type="button"
            className={`uv-hunt-toggle ${game.uvHuntEnabled ? "is-active" : ""}`}
            onClick={() => dispatch(toggleUvHunt())}
          >
            <Flashlight className="size-4" />
            {game.uvHuntEnabled ? "Tắt UV Hunt" : "Bật UV Hunt"}
          </button>

          {game.uvHuntEnabled && routeClues.length > 0 && (
            <div
              className="uv-hunt-overlay"
              style={{
                WebkitMaskImage: hiddenMask,
                maskImage: hiddenMask,
              }}
            >
              {routeClues.map((clue) => (
                <button
                  key={clue.id}
                  type="button"
                  className={`uv-hunt-clue ${
                    keywordBag[clue.keywordKey] ? "is-collected" : ""
                  }`}
                  style={clue.style}
                  onClick={() => dispatch(collectKeyword(clue.keywordKey))}
                >
                  {keywordBag[clue.keywordKey]
                    ? `ĐÃ NHẶT: ${clue.text}`
                    : `BẤM THU HOẠCH: ${clue.text}`}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="relative mx-auto flex w-full max-w-[96rem] flex-col gap-8 rounded-[1.4rem] border border-border/70 bg-surface/82 p-6 shadow-[0_24px_70px_rgb(0_0_0_/_0.34)] backdrop-blur-xl md:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Bảng điều phối điệp vụ
            </p>
            <h1 className="tracking-tighter text-3xl font-bold text-foreground">
              Trung tâm điều hành Spy Time
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

          {hasCompletedAllRooms && isInsideRoomArea && (
            <div className="w-full rounded-xl border border-brand/35 bg-brand/10 p-2.5">
              <p className="px-2 pb-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-orange-100">
                Chuyen phong nhanh sau khi hoan tat 4 ai
              </p>
              <div className="flex flex-wrap gap-2">
                {quickRoomLinks.map((roomLink) => (
                  <NavLink
                    key={roomLink.to}
                    to={roomLink.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-lg border px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] transition",
                        isActive
                          ? "border-brand bg-brand text-white"
                          : "border-border/70 bg-background/55 text-foreground hover:border-brand/50 hover:text-brand",
                      )
                    }
                  >
                    {roomLink.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
