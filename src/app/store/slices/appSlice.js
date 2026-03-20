import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectName: "Spy Time",
  missionCounter: 0,
  game: {
    unlockedStage: 1,
    completedStages: [],
    missionCompleted: false,
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

      if (![1, 2, 3].includes(stage)) {
        return;
      }

      if (!state.game.completedStages.includes(stage)) {
        state.game.completedStages.push(stage);
      }

      if (stage < 3) {
        state.game.unlockedStage = Math.max(
          state.game.unlockedStage,
          stage + 1,
        );
      }

      if (stage === 3) {
        state.game.missionCompleted = true;
      }
    },
    restartGame: (state) => {
      state.game = {
        unlockedStage: 1,
        completedStages: [],
        missionCompleted: false,
      };
    },
  },
});

export const {
  incrementMissionCounter,
  resetMissionCounter,
  completeStage,
  restartGame,
} = appSlice.actions;
export default appSlice.reducer;
