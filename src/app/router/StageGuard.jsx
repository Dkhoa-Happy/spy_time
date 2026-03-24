import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import {
  TOTAL_STAGE_COUNT,
  getResumeRoute,
} from "../../features/time-travel-spy/lib/gameConfig";

export const StageGuard = ({ requiredStage, children }) => {
  const game = useSelector((state) => state.app.game);
  const { unlockedStage, missionCompleted } = game;

  if (missionCompleted && requiredStage < TOTAL_STAGE_COUNT) {
    return <Navigate to={getResumeRoute(game)} replace />;
  }

  if (requiredStage > unlockedStage) {
    return <Navigate to={getResumeRoute(game)} replace />;
  }

  return children;
};
