import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";

import {
  TOTAL_STAGE_COUNT,
  getResumeRoute,
} from "../../features/time-travel-spy/lib/gameConfig";

export const StageGuard = ({ requiredStage, children }) => {
  const game = useSelector((state) => state.app.game);
  const { unlockedStage } = game;

  if (requiredStage > unlockedStage) {
    return <Navigate to={getResumeRoute(game)} replace />;
  }

  if (requiredStage < 1 || requiredStage > TOTAL_STAGE_COUNT) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
};
