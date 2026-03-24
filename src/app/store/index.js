import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./slices/appSlice";

const PROGRESS_STORAGE_KEY = "spy-time:progress:v1";

const sanitizeGameState = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const unlockedStage = Number(value.unlockedStage);
  const completedStages = Array.isArray(value.completedStages)
    ? value.completedStages
        .map((stage) => Number(stage))
        .filter((stage) => [1, 2, 3].includes(stage))
    : [];

  const uniqueCompletedStages = [...new Set(completedStages)].sort(
    (a, b) => a - b,
  );
  const inferredUnlockedStage =
    uniqueCompletedStages.length > 0
      ? Math.min(3, Math.max(...uniqueCompletedStages) + 1)
      : 1;

  const normalizedUnlockedStage = [1, 2, 3].includes(unlockedStage)
    ? Math.max(unlockedStage, inferredUnlockedStage)
    : inferredUnlockedStage;

  const missionCompleted =
    value.missionCompleted === true || uniqueCompletedStages.includes(3);

  const stage3PrepCompleted = value.stage3PrepCompleted === true;
  const uvHuntEnabled = value.uvHuntEnabled === true;
  const hasInventory = value.inventory && typeof value.inventory === "object";
  const inventory = {
    uvLight: Boolean(hasInventory ? value.inventory.uvLight : false),
    fieldNotebook: Boolean(
      hasInventory ? value.inventory.fieldNotebook : false,
    ),
    keywords: {
      khoiNguon: Boolean(
        hasInventory ? value.inventory?.keywords?.khoiNguon : false,
      ),
      docLap: Boolean(hasInventory ? value.inventory?.keywords?.docLap : false),
      doiMoi: Boolean(hasInventory ? value.inventory?.keywords?.doiMoi : false),
    },
  };

  // Migrate legacy saves: if prep was completed, ensure both items are present.
  if (stage3PrepCompleted) {
    inventory.uvLight = true;
    inventory.fieldNotebook = true;
  }

  return {
    unlockedStage: normalizedUnlockedStage,
    completedStages: uniqueCompletedStages,
    missionCompleted,
    stage3PrepCompleted,
    uvHuntEnabled,
    inventory,
  };
};

const loadPreloadedState = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const serialized = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!serialized) {
      return undefined;
    }

    const parsed = JSON.parse(serialized);
    const safeGameState = sanitizeGameState(parsed?.app?.game);

    if (!safeGameState) {
      return undefined;
    }

    return {
      app: {
        game: safeGameState,
      },
    };
  } catch {
    return undefined;
  }
};

const saveProgressState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const safeGameState = sanitizeGameState(state?.app?.game);
    if (!safeGameState) {
      return;
    }

    const payload = {
      app: {
        game: safeGameState,
      },
    };

    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write failures to keep gameplay uninterrupted.
  }
};

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
  preloadedState: loadPreloadedState(),
});

store.subscribe(() => {
  saveProgressState(store.getState());
});
