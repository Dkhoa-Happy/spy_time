import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectName: "Spy Time",
  missionCounter: 0,
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
  },
});

export const { incrementMissionCounter, resetMissionCounter } =
  appSlice.actions;
export default appSlice.reducer;
