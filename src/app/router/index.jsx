import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../../pages/home/ui/HomePage";
import { NotFoundPage } from "../../pages/not-found/ui/NotFoundPage";
import { TimeTravelSpyPage } from "../../pages/time-travel-spy/ui/TimeTravelSpyPage";
import { MissionAccomplishedPage } from "../../pages/mission-accomplished/ui/MissionAccomplishedPage";
import { ROUTES } from "../../shared/constants/routes";
import { StageGuard } from "./StageGuard";

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTES.stage1930,
        element: (
          <StageGuard requiredStage={1}>
            <TimeTravelSpyPage activeStage={1} />
          </StageGuard>
        ),
      },
      {
        path: ROUTES.stage1945,
        element: (
          <StageGuard requiredStage={2}>
            <TimeTravelSpyPage activeStage={2} />
          </StageGuard>
        ),
      },
      {
        path: ROUTES.stage1986,
        element: (
          <StageGuard requiredStage={3}>
            <TimeTravelSpyPage activeStage={3} />
          </StageGuard>
        ),
      },
      {
        path: ROUTES.missionComplete,
        element: <MissionAccomplishedPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
