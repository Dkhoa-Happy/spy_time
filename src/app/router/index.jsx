import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../../pages/home/ui/HomePage";
import { NotFoundPage } from "../../pages/not-found/ui/NotFoundPage";
import FragmentPuzzlePage from "../../pages/fragment-puzzle/ui/FragmentPuzzlePage";
import { ROUTES } from "../../shared/constants/routes";

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
        path: ROUTES.fragmentPuzzle,
        element: <FragmentPuzzlePage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
