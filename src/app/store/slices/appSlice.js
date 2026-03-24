import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectName: "Spy Time",
  missionCounter: 0,
  game: {
    unlockedStage: 1,
    completedStages: [],
    missionCompleted: false,
    stage1986PrepCompleted: false,
    inventory: {
      uvLight: false,
      fieldNotebook: false,
    },
  },
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
      if (!state.game.inventory || typeof state.game.inventory !== "object") {
        state.game.inventory = {
          uvLight: false,
          fieldNotebook: false,
        };
      }
      state.game.inventory.uvLight = true;
      state.game.inventory.fieldNotebook = true;
      state.game.unlockedStage = Math.max(state.game.unlockedStage, 4);
    },
    collectStage1986Item: (state, action) => {
      const itemKey = String(action.payload || "");

      if (!state.game.inventory || typeof state.game.inventory !== "object") {
        state.game.inventory = {
          uvLight: false,
          fieldNotebook: false,
        };
      }

      if (!["uvLight", "fieldNotebook"].includes(itemKey)) {
        return;
      }

      state.game.inventory[itemKey] = true;
    },
    restartGame: (state) => {
      state.game = {
        unlockedStage: 1,
        completedStages: [],
        missionCompleted: false,
        stage1986PrepCompleted: false,
        inventory: {
          uvLight: false,
          fieldNotebook: false,
        },
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
  restartGame,
} = appSlice.actions;
export default appSlice.reducer;
