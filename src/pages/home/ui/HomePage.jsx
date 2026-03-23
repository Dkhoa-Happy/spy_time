import { useDispatch, useSelector } from "react-redux";
import { Compass, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  completeStage,
  incrementMissionCounter,
  resetMissionCounter,
} from "../../../app/store/slices/appSlice";
import { Button } from "../../../shared/ui/button";
import { ROUTES } from "../../../shared/constants/routes";

const getResumeRoute = (game) => {
  if (game.missionCompleted) {
    return ROUTES.missionComplete;
  }

  if (game.unlockedStage >= 3) {
    return ROUTES.stage1986;
  }

  if (game.unlockedStage === 2) {
    return ROUTES.stage1945;
  }

  return ROUTES.stage1930;
};

export const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectName, missionCounter, game } = useSelector(
    (state) => state.app,
  );
  const resumeRoute = getResumeRoute(game);
  const hasProgress =
    game.completedStages.length > 0 ||
    game.unlockedStage > 1 ||
    game.missionCompleted;

  const unlockToStageThreeForTesting = () => {
    dispatch(completeStage(1));
    dispatch(completeStage(2));
    navigate(ROUTES.stage1986);
  };

  return (
    <section className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <article className="rounded-xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Hồ sơ nhiệm vụ
        </p>
        <h2 className="mt-3 tracking-tighter text-4xl font-semibold text-foreground">
          {projectName}
        </h2>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Bạn vào vai điệp viên xuyên thời gian. Giải mã từng căn phòng lịch sử
          để mở khóa sự kiện then chốt 1930, 1945 và 1986.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to={resumeRoute}>
              <Compass className="size-4" />
              {hasProgress ? "Tiếp tục nhiệm vụ" : "Bắt đầu nhiệm vụ"}
            </Link>
          </Button>

          <Button variant="secondary" onClick={unlockToStageThreeForTesting}>
            Mở nhanh Stage 3 (test)
          </Button>
        </div>
      </article>

      <aside className="rounded-xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Tiến độ giải mã
        </p>

        <p className="mt-5 text-sm text-muted-foreground">Phòng đã mở khóa</p>
        <p className="mt-1 tracking-tighter text-4xl font-bold text-foreground">
          {game.unlockedStage}/3
        </p>
      </aside>
    </section>
  );
};
