import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./slices/appSlice";

const PROGRESS_STORAGE_KEY = "spy-time:progress:v2";
const LEGACY_PROGRESS_STORAGE_KEY = "spy-time:progress:v1";
const VALID_STAGE_IDS = [1, 2, 3, 4];
const LEGACY_STAGE_IDS = [1, 2, 3];
const LEGACY_COMPLETED_STAGE_IDS = [1, 2];

const sanitizeGameState = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const unlockedStage = Number(value.unlockedStage);
  const completedStages = Array.isArray(value.completedStages)
    ? value.completedStages
        .map((stage) => Number(stage))
        .filter((stage) => VALID_STAGE_IDS.includes(stage))
    : [];

  const uniqueCompletedStages = [...new Set(completedStages)].sort(
    (a, b) => a - b,
  );
  const inferredUnlockedStage =
    uniqueCompletedStages.length > 0
      ? Math.min(VALID_STAGE_IDS.length, Math.max(...uniqueCompletedStages) + 1)
      : 1;

  const stage3PrepCompleted = value.stage3PrepCompleted === true;
  const uvHuntEnabled = value.uvHuntEnabled === true;
  const hasInventory = value.inventory && typeof value.inventory === "object";
  const missionCompleted =
    value.missionCompleted === true || uniqueCompletedStages.includes(4);
  const stage1986PrepCompleted =
    value.stage1986PrepCompleted === true || uniqueCompletedStages.includes(4);
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

  if (stage1986PrepCompleted) {
    inventory.uvLight = true;
    inventory.fieldNotebook = true;
  }

  let normalizedUnlockedStage = VALID_STAGE_IDS.includes(unlockedStage)
    ? Math.max(unlockedStage, inferredUnlockedStage)
    : inferredUnlockedStage;

  if (stage1986PrepCompleted || stage3PrepCompleted) {
    normalizedUnlockedStage = Math.max(normalizedUnlockedStage, 4);
  }

  return {
    unlockedStage: normalizedUnlockedStage,
    completedStages: uniqueCompletedStages,
    missionCompleted,
    stage1986PrepCompleted,
    stage3PrepCompleted,
    uvHuntEnabled,
    inventory,
  };
};

const sanitizeLegacyGameState = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const legacyUnlockedStage = Number(value.unlockedStage);
  const legacyCompletedStages = Array.isArray(value.completedStages)
    ? value.completedStages
        .map((stage) => Number(stage))
        .filter((stage) => LEGACY_STAGE_IDS.includes(stage))
    : [];
  const uniqueCompletedStages = [
    ...new Set(
      legacyCompletedStages.filter((stage) =>
        LEGACY_COMPLETED_STAGE_IDS.includes(stage),
      ),
    ),
  ].sort((a, b) => a - b);

  const touchedStage1986 =
    legacyUnlockedStage >= 3 ||
    legacyCompletedStages.includes(3) ||
    value.missionCompleted === true ||
    value.stage3PrepCompleted === true ||
    Boolean(value.inventory?.uvLight) ||
    Boolean(value.inventory?.fieldNotebook);

  let normalizedUnlockedStage = 1;

  if (legacyUnlockedStage >= 2 || uniqueCompletedStages.includes(1)) {
    normalizedUnlockedStage = 2;
  }

  if (legacyUnlockedStage >= 3 || uniqueCompletedStages.includes(2)) {
    normalizedUnlockedStage = 3;
  }

  if (touchedStage1986) {
    normalizedUnlockedStage = Math.max(normalizedUnlockedStage, 3);
  }

  return {
    unlockedStage: normalizedUnlockedStage,
    completedStages: uniqueCompletedStages,
    missionCompleted: false,
    stage1986PrepCompleted: false,
    stage3PrepCompleted: false,
    uvHuntEnabled: false,
    inventory: {
      uvLight: false,
      fieldNotebook: false,
      keywords: {
        khoiNguon: false,
        docLap: false,
        doiMoi: false,
      },
    },
  };
};

const loadPreloadedState = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const serialized = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    let safeGameState = null;

    if (serialized) {
      const parsed = JSON.parse(serialized);
      safeGameState = sanitizeGameState(parsed?.app?.game);
    }

    if (!safeGameState) {
      const legacySerialized = window.localStorage.getItem(
        LEGACY_PROGRESS_STORAGE_KEY,
      );

      if (legacySerialized) {
        const legacyParsed = JSON.parse(legacySerialized);
        safeGameState = sanitizeLegacyGameState(legacyParsed?.app?.game);
      }
    }

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
