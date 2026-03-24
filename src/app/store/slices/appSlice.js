import { createSlice } from "@reduxjs/toolkit";

const createDefaultInventory = () => ({
  uvLight: false,
  fieldNotebook: false,
  keywords: {
    khoiNguon: false,
    docLap: false,
    thongNhat: false,
    doiMoi: false,
  },
});

const initialState = {
  projectName: "Spy Time",
  missionCounter: 0,
  game: {
    unlockedStage: 1,
    completedStages: [],
    missionCompleted: false,
    stage1986PrepCompleted: false,
    stage3PrepCompleted: false,
    uvHuntEnabled: false,
    inventory: createDefaultInventory(),
  },
};

const ensureInventoryShape = (state) => {
  if (!state.game.inventory || typeof state.game.inventory !== "object") {
    state.game.inventory = createDefaultInventory();
    return;
  }

  if (typeof state.game.inventory.uvLight !== "boolean") {
    state.game.inventory.uvLight = false;
  }

  if (typeof state.game.inventory.fieldNotebook !== "boolean") {
    state.game.inventory.fieldNotebook = false;
  }

  if (
    !state.game.inventory.keywords ||
    typeof state.game.inventory.keywords !== "object"
  ) {
    state.game.inventory.keywords = {
      khoiNguon: false,
      docLap: false,
      thongNhat: false,
      doiMoi: false,
    };
  }
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    incrementMissionCounter: (state) => {
      state.missionCounter += 1;
    },
    resetMissionCounter: (state) => {
      state.missionCounter = 0;
    },
    completeStage: (state, action) => {
      const stage = Number(action.payload);

      if (![1, 2, 3, 4].includes(stage)) {
        return;
      }

      if (!state.game.completedStages.includes(stage)) {
        state.game.completedStages.push(stage);
      }

      if (stage < 4) {
        state.game.unlockedStage = Math.max(
          state.game.unlockedStage,
          stage + 1,
        );
      }

      if (stage === 4) {
        state.game.missionCompleted = true;
      }
    },
    completeStage1986Prep: (state) => {
      state.game.stage1986PrepCompleted = true;
      ensureInventoryShape(state);
      state.game.inventory.uvLight = true;
      state.game.inventory.fieldNotebook = true;
      state.game.unlockedStage = Math.max(state.game.unlockedStage, 4);
    },
    completeStage3Prep: (state) => {
      state.game.stage3PrepCompleted = true;
      state.game.stage1986PrepCompleted = true;
      ensureInventoryShape(state);
      state.game.inventory.uvLight = true;
      state.game.inventory.fieldNotebook = true;
      state.game.unlockedStage = Math.max(state.game.unlockedStage, 4);
    },
    collectStage1986Item: (state, action) => {
      const itemKey = String(action.payload || "");
      ensureInventoryShape(state);

      if (!["uvLight", "fieldNotebook"].includes(itemKey)) {
        return;
      }

      state.game.inventory[itemKey] = true;
    },
    setUvHuntEnabled: (state, action) => {
      state.game.uvHuntEnabled = Boolean(action.payload);
    },
    toggleUvHunt: (state) => {
      state.game.uvHuntEnabled = !state.game.uvHuntEnabled;
    },
    collectStage3Item: (state, action) => {
      const itemKey = String(action.payload || "");

      ensureInventoryShape(state);

      if (!["uvLight", "fieldNotebook"].includes(itemKey)) {
        return;
      }

      state.game.inventory[itemKey] = true;
    },
    collectKeyword: (state, action) => {
      const keywordKey = String(action.payload || "");
      ensureInventoryShape(state);

      if (
        !["khoiNguon", "docLap", "thongNhat", "doiMoi"].includes(keywordKey)
      ) {
        return;
      }

      state.game.inventory.keywords[keywordKey] = true;
    },
    restartGame: (state) => {
      state.game = {
        unlockedStage: 1,
        completedStages: [],
        missionCompleted: false,
        stage1986PrepCompleted: false,
        stage3PrepCompleted: false,
        uvHuntEnabled: false,
        inventory: createDefaultInventory(),
      };
    },
  },
});

export const {
  incrementMissionCounter,
  resetMissionCounter,
  completeStage,
  collectStage1986Item,
  completeStage1986Prep,
  collectStage3Item,
  collectKeyword,
  setUvHuntEnabled,
  toggleUvHunt,
  completeStage3Prep,
  restartGame,
} = appSlice.actions;
export default appSlice.reducer;
