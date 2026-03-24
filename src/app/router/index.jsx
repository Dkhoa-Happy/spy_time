import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../../pages/home/ui/HomePage";
import { NotFoundPage } from "../../pages/not-found/ui/NotFoundPage";
import FragmentPuzzlePage from "../../pages/fragment-puzzle/ui/FragmentPuzzlePage";
import { TimeTravelSpyPage } from "../../pages/time-travel-spy/ui/TimeTravelSpyPage";
import { Stage1986PrepMapPage } from "../../pages/time-travel-spy-prep/ui/Stage1986PrepMapPage";
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
        element: <FragmentPuzzlePage />,
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
        path: ROUTES.stage1975,
        element: (
          <StageGuard requiredStage={3}>
            <TimeTravelSpyPage activeStage={3} />
          </StageGuard>
        ),
      },
      {
        path: ROUTES.stage1986,
        element: (
          <StageGuard requiredStage={4}>
            <TimeTravelSpyPage activeStage={4} />
          </StageGuard>
        ),
      },
      {
        path: ROUTES.stage1986Prep,
        element: (
          <StageGuard requiredStage={4}>
            <Stage1986PrepMapPage />
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
