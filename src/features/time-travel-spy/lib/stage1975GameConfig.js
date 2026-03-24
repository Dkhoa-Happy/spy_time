import { STAGE_STORY_BRIEFINGS } from "./stageStoryBriefings";

export const STAGE_1975_WORLD = {
  width: 1000,
  height: 620,
};

export const STAGE_1975_FENCE = {
  left: 130,
  top: 92,
  right: 870,
  bottom: 526,
};

export const STAGE_1975_PLOTS = [
  { id: "plot-1", label: "Ô lúa 1", x: 350, y: 312 },
  { id: "plot-2", label: "Ô lúa 2", x: 500, y: 312 },
  { id: "plot-3", label: "Ô lúa 3", x: 650, y: 312 },
];

export const STAGE_1975_SOLDIER_POSTS = [
  { x: 264, y: 188, label: "Chốt trái" },
  { x: 736, y: 188, label: "Chốt phải" },
];

export const STAGE_1975_FARM_LEVELS = [
  { growDuration: 8.2, yieldAmount: 16 },
  { growDuration: 7.1, yieldAmount: 22 },
  { growDuration: 6.1, yieldAmount: 29 },
  { growDuration: 5.3, yieldAmount: 36 },
];

export const STAGE_1975_FENCE_LEVELS = [
  { maxHp: 180 },
  { maxHp: 250 },
  { maxHp: 330 },
  { maxHp: 420 },
];

export const STAGE_1975_WEAPON_LEVELS = [
  { damage: 18 },
  { damage: 26 },
  { damage: 35 },
  { damage: 45 },
];

export const STAGE_1975_ACTION_COSTS = {
  unlockPlot: [45, 70],
  upgradeFarm: [60, 95, 135],
  hireFarmer: {
    money: 55,
    food: 16,
  },
  hireSoldier: [
    { money: 45, food: 18 },
    { money: 60, food: 24 },
  ],
  upgradeFence: [55, 90, 130],
  forgeHoe: [45, 75, 110],
};

export const STAGE_1975_WAVE_TARGET = 10;
export const STAGE_1975_UPKEEP_INTERVAL = 6;
export const STAGE_1975_TUTORIAL_WAVE = 1;

export const getStage1975WaveEnemyCount = (wave) => {
  if (wave <= STAGE_1975_TUTORIAL_WAVE) {
    return 0;
  }

  return wave + 2;
};

export const getStage1975WaveStoryNotice = (wave) => {
  if (wave === STAGE_1975_TUTORIAL_WAVE) {
    return "Màn 1 là hậu phương an toàn. Hãy gieo lúa ở ruộng đầu tiên và mở thêm 1 ô trồng lúa để sang màn 2.";
  }

  if (wave <= 2) {
    return STAGE_STORY_BRIEFINGS.screen5.body.join(" ");
  }

  if (wave <= 5) {
    return "Biên giới bất ổn lan thành những đợt tấn công lớn hơn. Giữ hàng rào và chia lương thực cẩn thận.";
  }

  if (wave <= 8) {
    return STAGE_STORY_BRIEFINGS.screen6.body.join(" ");
  }

  return "Chiến sự lan rộng. Vừa sản xuất, vừa bảo vệ biên giới và làm nghĩa vụ quốc tế. Trụ vững nốt đợt này để mở chặng tiếp theo.";
};

export const getStage1975EnemyStats = (wave) => {
  const combatWave = Math.max(1, wave - STAGE_1975_TUTORIAL_WAVE);

  return {
    maxHp: 28 + combatWave * 8,
    damage: 6 + combatWave * 1.3,
    speed: 42 + combatWave * 3,
    reward: 12 + combatWave * 2,
  };
};

export const createStage1975InitialPlots = () =>
  STAGE_1975_PLOTS.map((plot, index) => ({
    ...plot,
    unlocked: index === 0,
    status: "empty",
    progress: 0,
    growDuration: STAGE_1975_FARM_LEVELS[0].growDuration,
    yieldAmount: STAGE_1975_FARM_LEVELS[0].yieldAmount,
  }));

export const createStage1975InitialState = () => ({
  phase: "playing",
  notice: getStage1975WaveStoryNotice(1),
  wave: 1,
  waveKills: 0,
  remainingWaveSpawns: getStage1975WaveEnemyCount(1),
  waveSpawnTimer: 1.1,
  intermissionTimer: 0,
  nextEnemyId: 1,
  nextCoinId: 1,
  money: 70,
  food: 30,
  farmLevel: 1,
  fenceLevel: 1,
  weaponLevel: 1,
  openedPlots: 1,
  upkeepTimer: STAGE_1975_UPKEEP_INTERVAL,
  fenceHp: STAGE_1975_FENCE_LEVELS[0].maxHp,
  fenceMaxHp: STAGE_1975_FENCE_LEVELS[0].maxHp,
  tutorial: {
    plantedRice: false,
    unlockedExtraPlot: false,
  },
  plots: createStage1975InitialPlots(),
  enemies: [],
  coins: [],
  farmer: {
    hired: false,
    x: 438,
    y: 458,
    targetPlotId: "",
    status: "Chưa tuyển",
  },
  soldiersHired: 0,
  soldiers: STAGE_1975_SOLDIER_POSTS.map((post, index) => ({
    id: `soldier-${index + 1}`,
    ...post,
    homeX: post.x,
    homeY: post.y,
    active: false,
    attackCooldown: 0,
  })),
  player: {
    x: 500,
    y: 452,
    targetX: 500,
    targetY: 452,
    hp: 160,
    maxHp: 160,
    damage: STAGE_1975_WEAPON_LEVELS[0].damage,
    speed: 170,
    attackCooldown: 0,
    attackPulse: 0,
    intent: null,
    currentPlotContactId: null,
  },
  stats: {
    totalKills: 0,
  },
});
