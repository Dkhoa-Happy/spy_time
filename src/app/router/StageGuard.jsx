import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { ROUTES } from "../../shared/constants/routes";

export const StageGuard = ({ requiredStage, children }) => {
  const { unlockedStage, missionCompleted } = useSelector(
    (state) => state.app.game,
  );

  if (missionCompleted && requiredStage < 3) {
    return <Navigate to={ROUTES.missionComplete} replace />;
  }

  if (requiredStage > unlockedStage) {
    if (unlockedStage === 1) {
      return <Navigate to={ROUTES.stage1930} replace />;
    }

    if (unlockedStage === 2) {
      return <Navigate to={ROUTES.stage1945} replace />;
    }

    return <Navigate to={ROUTES.stage1986} replace />;
  }

  return children;
};
