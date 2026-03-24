import {
  STAGE_1975_ACTION_COSTS,
  STAGE_1975_FARM_LEVELS,
  STAGE_1975_FENCE,
  STAGE_1975_FENCE_LEVELS,
  STAGE_1975_SOLDIER_POSTS,
  STAGE_1975_TUTORIAL_WAVE,
  STAGE_1975_UPKEEP_INTERVAL,
  STAGE_1975_WAVE_TARGET,
  STAGE_1975_WEAPON_LEVELS,
  STAGE_1975_WORLD,
  createStage1975InitialState,
  getStage1975EnemyStats,
  getStage1975WaveStoryNotice,
  getStage1975WaveEnemyCount,
} from "./stage1975GameConfig";

const PLAYER_ATTACK_RANGE = 86;
const PLAYER_ATTACK_COOLDOWN = 0.72;
const SOLDIER_ATTACK_RANGE = 310;
const SOLDIER_AGGRO_RANGE = 380;
const SOLDIER_ATTACK_COOLDOWN = 1.05;
const SOLDIER_MOVE_SPEED = 136;
const SOLDIER_HOLD_RANGE = 210;
const SOLDIER_RETREAT_RANGE = 112;
const SOLDIER_HOME_LEASH = 188;
const FARMER_SPEED = 124;
const FARMER_HOME = { x: 438, y: 458 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getDistance = (from, to) =>
  Math.hypot((to.x ?? 0) - (from.x ?? 0), (to.y ?? 0) - (from.y ?? 0));

const movePoint = (current, target, speed, delta) => {
  const distance = getDistance(current, target);
  if (distance <= 0.001) {
    return { x: target.x, y: target.y };
  }

  const step = speed * delta;
  if (distance <= step) {
    return { x: target.x, y: target.y };
  }

  const ratio = step / distance;
  return {
    x: current.x + (target.x - current.x) * ratio,
    y: current.y + (target.y - current.y) * ratio,
  };
};

const clampPointToRadius = (origin, target, radius) => {
  const distance = getDistance(origin, target);
  if (distance <= radius) {
    return target;
  }

  const ratio = radius / distance;
  return {
    x: origin.x + (target.x - origin.x) * ratio,
    y: origin.y + (target.y - origin.y) * ratio,
  };
};

const createSpawnPoint = () => {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) {
    return {
      x: Math.random() * STAGE_1975_WORLD.width,
      y: 18,
    };
  }

  if (edge === 1) {
    return {
      x: STAGE_1975_WORLD.width - 18,
      y: Math.random() * STAGE_1975_WORLD.height,
    };
  }

  if (edge === 2) {
    return {
      x: Math.random() * STAGE_1975_WORLD.width,
      y: STAGE_1975_WORLD.height - 18,
    };
  }

  return {
    x: 18,
    y: Math.random() * STAGE_1975_WORLD.height,
  };
};

const getNearestFencePoint = (entity) => {
  const clampedX = clamp(
    entity.x,
    STAGE_1975_FENCE.left,
    STAGE_1975_FENCE.right,
  );
  const clampedY = clamp(
    entity.y,
    STAGE_1975_FENCE.top,
    STAGE_1975_FENCE.bottom,
  );

  const candidates = [
    { x: clampedX, y: STAGE_1975_FENCE.top },
    { x: STAGE_1975_FENCE.right, y: clampedY },
    { x: clampedX, y: STAGE_1975_FENCE.bottom },
    { x: STAGE_1975_FENCE.left, y: clampedY },
  ];

  return candidates.reduce((nearest, candidate) =>
    getDistance(entity, candidate) < getDistance(entity, nearest)
      ? candidate
      : nearest,
  );
};

const getFarmSpec = (level) => STAGE_1975_FARM_LEVELS[level - 1];
const getFenceSpec = (level) => STAGE_1975_FENCE_LEVELS[level - 1];
const getWeaponSpec = (level) => STAGE_1975_WEAPON_LEVELS[level - 1];
const isStage1975TutorialWave = (state) => state.wave === STAGE_1975_TUTORIAL_WAVE;
const hasCompletedStage1975Tutorial = (state) =>
  Boolean(state.tutorial?.plantedRice) &&
  (Boolean(state.tutorial?.unlockedExtraPlot) || state.openedPlots > 1);

export const formatStage1975Cost = (cost) => {
  if (!cost) {
    return "Da toi da";
  }

  if (typeof cost === "number") {
    return `${cost} tien`;
  }

  return `${cost.money} tien • ${cost.food} luong thuc`;
};

export const canAffordStage1975Cost = (game, cost) => {
  if (!cost) {
    return false;
  }

  if (typeof cost === "number") {
    return game.money >= cost;
  }

  return game.money >= cost.money && game.food >= cost.food;
};

const spendCost = (game, cost) => {
  if (typeof cost === "number") {
    return {
      ...game,
      money: game.money - cost,
    };
  }

  return {
    ...game,
    money: game.money - cost.money,
    food: game.food - cost.food,
  };
};

const cloneState = (state) => ({
  ...state,
  player: { ...state.player },
  farmer: { ...state.farmer },
  tutorial: { ...state.tutorial },
  soldiers: state.soldiers.map((soldier) => ({ ...soldier })),
  plots: state.plots.map((plot) => ({ ...plot })),
  enemies: state.enemies.map((enemy) => ({ ...enemy })),
  coins: state.coins.map((coin) => ({ ...coin })),
  stats: { ...state.stats },
});

const selectNearestEnemyIndex = (enemies, source, range) => {
  let nearestIndex = -1;
  let nearestDistance = range;

  enemies.forEach((enemy, index) => {
    const distance = getDistance(source, enemy);
    if (distance <= nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
};

const resolvePlotAction = (game, plotId, actor) => {
  const plot = game.plots.find((item) => item.id === plotId);

  if (!plot || !plot.unlocked) {
    return game;
  }

  const farmSpec = getFarmSpec(game.farmLevel);
  plot.growDuration = farmSpec.growDuration;
  plot.yieldAmount = farmSpec.yieldAmount;

  if (plot.status === "empty") {
    plot.status = "growing";
    plot.progress = 0;

    if (isStage1975TutorialWave(game)) {
      game.tutorial.plantedRice = true;
    }

    if (actor === "player") {
      game.notice = `Ban vua gieo lua o ${plot.label}.`;
    } else {
      game.farmer.status = `Dang gieo ${plot.label}`;
      game.farmer.targetPlotId = plot.id;
    }

    return game;
  }

  if (plot.status === "ready") {
    plot.status = "empty";
    plot.progress = 0;
    game.food += plot.yieldAmount;

    if (actor === "player") {
      game.notice = `Thu hoach ${plot.label}: +${plot.yieldAmount} luong thuc.`;
    } else {
      game.farmer.status = `Thu hoach ${plot.label}`;
      game.farmer.targetPlotId = plot.id;
    }

    return game;
  }

  if (actor === "player") {
    game.notice = `${plot.label} con dang lon. Cho them mot chut nua.`;
  } else {
    game.farmer.status = `Dang cho ${plot.label} chin`;
  }

  return game;
};

const collectNearbyCoins = (game) => {
  const remainingCoins = [];

  game.coins.forEach((coin) => {
    if (getDistance(game.player, coin) <= 28) {
      game.money += coin.value;
      game.notice = `Nhat duoc ${coin.value} tien tu chien loi pham.`;
      return;
    }

    if (coin.ttl > 0) {
      remainingCoins.push(coin);
    }
  });

  game.coins = remainingCoins;
  return game;
};

const removeDefeatedEnemies = (game) => {
  const survivors = [];

  game.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) {
      game.coins.push({
        id: `coin-${game.nextCoinId}`,
        x: enemy.x,
        y: enemy.y,
        value: enemy.reward,
        ttl: 18,
      });
      game.nextCoinId += 1;
      game.waveKills += 1;
      game.stats.totalKills += 1;
      return;
    }

    survivors.push(enemy);
  });

  game.enemies = survivors;
  return game;
};

const chooseFarmerPlot = (game) => {
  const unlockedPlots = game.plots.filter((plot) => plot.unlocked);
  const readyPlots = unlockedPlots.filter((plot) => plot.status === "ready");
  const emptyPlots = unlockedPlots.filter((plot) => plot.status === "empty");
  const candidates = readyPlots.length > 0 ? readyPlots : emptyPlots;

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((nearest, candidate) =>
    getDistance(game.farmer, candidate) < getDistance(game.farmer, nearest)
      ? candidate
      : nearest,
  );
};

const getPlayerContactPlot = (game, radius = 24) =>
  game.plots.find(
    (plot) => plot.unlocked && getDistance(game.player, plot) <= radius,
  ) ?? null;

const spawnEnemy = (game) => {
  const spawnPoint = createSpawnPoint();
  const enemyStats = getStage1975EnemyStats(game.wave);
  const combatWave = Math.max(1, game.wave - STAGE_1975_TUTORIAL_WAVE);

  game.enemies.push({
    id: `enemy-${game.nextEnemyId}`,
    x: spawnPoint.x,
    y: spawnPoint.y,
    hp: enemyStats.maxHp,
    maxHp: enemyStats.maxHp,
    damage: enemyStats.damage,
    speed: enemyStats.speed,
    reward: enemyStats.reward,
    attackCooldown: 0,
  });
  game.nextEnemyId += 1;
  game.remainingWaveSpawns -= 1;
  game.waveSpawnTimer = Math.max(0.42, 1.02 - combatWave * 0.04);
  return game;
};

const getStage1975MissionState = (state) => {
  if (isStage1975TutorialWave(state)) {
    const plantedRice = Boolean(state.tutorial?.plantedRice);
    const unlockedExtraPlot =
      Boolean(state.tutorial?.unlockedExtraPlot) || state.openedPlots > 1;
    const completedSteps = Number(plantedRice) + Number(unlockedExtraPlot);

    return {
      isTutorialWave: true,
      missionTitle: "Nhiệm vụ màn 1: Trồng lúa",
      missionDescription:
        "Màn này chưa có quân địch. Gieo lúa ở một ô ruộng và mở thêm 1 ô trồng lúa để sang màn 2.",
      missionProgressLabel: `${completedSteps}/2 mục tiêu`,
      missionChecklist: [
        {
          id: "plant-rice",
          label: "Gieo lúa ở một ô ruộng",
          completed: plantedRice,
        },
        {
          id: "unlock-plot",
          label: "Mở thêm 1 ô trồng lúa",
          completed: unlockedExtraPlot,
        },
      ],
    };
  }

  const currentWaveTarget = getStage1975WaveEnemyCount(state.wave);

  return {
    isTutorialWave: false,
    missionTitle: `Nhiệm vụ wave ${state.wave}: Giữ nông trại`,
    missionDescription:
      "Đẩy lùi quân địch, giữ hàng rào và duy trì lương thực để trụ vững qua 10 wave.",
    missionProgressLabel: `${state.waveKills}/${currentWaveTarget} quân địch đã bị chặn`,
    missionChecklist: [
      {
        id: "clear-wave",
        label: `Hạ hết ${currentWaveTarget} quân địch của wave này`,
        completed: state.remainingWaveSpawns === 0 && state.enemies.length === 0,
      },
    ],
  };
};

export const getStage1975UiState = (state) => ({
  ...getStage1975MissionState(state),
  phase: state.phase,
  notice: state.notice,
  wave: state.wave,
  waveKills: state.waveKills,
  currentWaveTarget: getStage1975WaveEnemyCount(state.wave),
  remainingThreats: state.remainingWaveSpawns + state.enemies.length,
  money: state.money,
  food: state.food,
  farmLevel: state.farmLevel,
  fenceLevel: state.fenceLevel,
  weaponLevel: state.weaponLevel,
  fenceHp: state.fenceHp,
  fenceMaxHp: state.fenceMaxHp,
  openedPlots: state.openedPlots,
  unlockedPlots: state.plots.filter((plot) => plot.unlocked).length,
  farmerHired: state.farmer.hired,
  farmerStatus: state.farmer.hired ? state.farmer.status : "Chua tuyen",
  soldiersHired: state.soldiersHired,
  activeSoldiers: state.soldiers.filter((soldier) => soldier.active).length,
  playerHp: state.player.hp,
  totalKills: state.stats.totalKills,
  isAutomationPaused:
    state.food === 0 &&
    (state.farmer.hired || state.soldiers.some((soldier) => soldier.active)),
});

export const moveStage1975PlayerToPoint = (state, point) => {
  const game = cloneState(state);
  if (game.phase !== "playing") {
    return game;
  }

  game.player.targetX = clamp(point.x, 20, STAGE_1975_WORLD.width - 20);
  game.player.targetY = clamp(point.y, 20, STAGE_1975_WORLD.height - 20);
  game.player.intent = null;
  game.notice = "Diep vien dang co dong trong khu vuon.";
  return game;
};

export const moveStage1975PlayerToPlot = (state, plotId) => {
  const game = cloneState(state);
  if (game.phase !== "playing") {
    return game;
  }

  const plot = game.plots.find((item) => item.id === plotId);

  if (!plot?.unlocked) {
    game.notice = "O ruong nay con khoa. Dung tien chien loi pham de mo.";
    return game;
  }

  game.player.targetX = plot.x;
  game.player.targetY = plot.y;
  game.player.intent = {
    type: "plot",
    plotId,
  };
  game.notice = `Diep vien dang tiep can ${plot.label}.`;
  return game;
};

export const restartStage1975Room = () => createStage1975InitialState();

export const unlockStage1975Plot = (state) => {
  const game = cloneState(state);

  if (game.phase !== "playing") {
    return game;
  }

  const nextPlotIndex = game.openedPlots;
  const cost = STAGE_1975_ACTION_COSTS.unlockPlot[nextPlotIndex - 1];

  if (!cost) {
    game.notice = "Toan bo 3 o ruong da duoc mo.";
    return game;
  }

  if (!canAffordStage1975Cost(game, cost)) {
    game.notice = `Khong du tien de mo ruong moi. Can ${cost} tien.`;
    return game;
  }

  const updated = spendCost(game, cost);
  updated.plots = updated.plots.map((plot, index) =>
    index === nextPlotIndex ? { ...plot, unlocked: true } : plot,
  );
  updated.openedPlots += 1;
  if (isStage1975TutorialWave(updated)) {
    updated.tutorial.unlockedExtraPlot = true;
  }
  updated.notice = `Da mo them ${updated.plots[nextPlotIndex]?.label ?? "mot o ruong moi"}.`;
  return updated;
};

export const upgradeStage1975Farm = (state) => {
  const game = cloneState(state);

  if (game.phase !== "playing") {
    return game;
  }

  const cost = STAGE_1975_ACTION_COSTS.upgradeFarm[game.farmLevel - 1];

  if (!cost) {
    game.notice = "Nong trai da dat cap toi da.";
    return game;
  }

  if (!canAffordStage1975Cost(game, cost)) {
    game.notice = `Chua du tai chinh de nang nong trai. Can ${cost} tien.`;
    return game;
  }

  const updated = spendCost(game, cost);
  const nextFarmLevel = updated.farmLevel + 1;
  const farmSpec = getFarmSpec(nextFarmLevel);

  updated.farmLevel = nextFarmLevel;
  updated.plots = updated.plots.map((plot) => ({
    ...plot,
    growDuration: farmSpec.growDuration,
    yieldAmount: farmSpec.yieldAmount,
    progress: Math.min(plot.progress, farmSpec.growDuration),
    status:
      plot.status === "growing" && plot.progress >= farmSpec.growDuration
        ? "ready"
        : plot.status,
  }));
  updated.notice = `Nong trai len cap ${nextFarmLevel}. Lua chin nhanh hon va cho nhieu luong thuc hon.`;
  return updated;
};

export const hireStage1975Farmer = (state) => {
  const game = cloneState(state);

  if (game.phase !== "playing") {
    return game;
  }

  if (game.farmer.hired) {
    game.notice = "Ban da co mot nong dan dang van hanh ruong.";
    return game;
  }

  if (!canAffordStage1975Cost(game, STAGE_1975_ACTION_COSTS.hireFarmer)) {
    game.notice = "Khong du tien hoac luong thuc de goi nong dan dau tien.";
    return game;
  }

  const updated = spendCost(game, STAGE_1975_ACTION_COSTS.hireFarmer);
  updated.farmer = {
    ...updated.farmer,
    hired: true,
    x: FARMER_HOME.x,
    y: FARMER_HOME.y,
    targetPlotId: "",
    status: "Da vao vi tri",
  };
  updated.notice =
    "Nong dan da vao ruong. Tu gio viec gieo va thu hoach se tu dong khi con luong thuc.";
  return updated;
};

export const hireStage1975Soldier = (state) => {
  const game = cloneState(state);

  if (game.phase !== "playing") {
    return game;
  }

  if (game.soldiersHired >= STAGE_1975_SOLDIER_POSTS.length) {
    game.notice = "Toan bo vi tri gac da co bo doi.";
    return game;
  }

  const cost = STAGE_1975_ACTION_COSTS.hireSoldier[game.soldiersHired];
  if (!canAffordStage1975Cost(game, cost)) {
    game.notice = "Chua du tien hoac luong thuc de goi them bo doi.";
    return game;
  }

  const updated = spendCost(game, cost);
  const nextIndex = updated.soldiersHired;
  updated.soldiersHired += 1;
  updated.soldiers = updated.soldiers.map((soldier, index) =>
    index === nextIndex ? { ...soldier, active: true } : soldier,
  );
  updated.notice = `Da goi bo doi toi ${updated.soldiers[nextIndex]?.label ?? "chot gac"}.`;
  return updated;
};

export const upgradeStage1975Fence = (state) => {
  const game = cloneState(state);

  if (game.phase !== "playing") {
    return game;
  }

  const cost = STAGE_1975_ACTION_COSTS.upgradeFence[game.fenceLevel - 1];

  if (!cost) {
    game.notice = "Hang rao da duoc gia co toi da.";
    return game;
  }

  if (!canAffordStage1975Cost(game, cost)) {
    game.notice = "Khong du tien de nang va va hang rao.";
    return game;
  }

  const updated = spendCost(game, cost);
  const nextFenceLevel = updated.fenceLevel + 1;
  const fenceSpec = getFenceSpec(nextFenceLevel);

  updated.fenceLevel = nextFenceLevel;
  updated.fenceMaxHp = fenceSpec.maxHp;
  updated.fenceHp = Math.min(
    fenceSpec.maxHp,
    updated.fenceHp + Math.round(fenceSpec.maxHp * 0.42),
  );
  updated.notice = `Hang rao da duoc nang len cap ${nextFenceLevel} va va lai mot phan.`;
  return updated;
};

export const forgeStage1975Hoe = (state) => {
  const game = cloneState(state);

  if (game.phase !== "playing") {
    return game;
  }

  const cost = STAGE_1975_ACTION_COSTS.forgeHoe[game.weaponLevel - 1];

  if (!cost) {
    game.notice = "Cuoc chien da duoc ren toi da.";
    return game;
  }

  if (!canAffordStage1975Cost(game, cost)) {
    game.notice = "Khong du tien de ren cuoc chien.";
    return game;
  }

  const updated = spendCost(game, cost);
  const nextWeaponLevel = updated.weaponLevel + 1;
  const weaponSpec = getWeaponSpec(nextWeaponLevel);

  updated.weaponLevel = nextWeaponLevel;
  updated.player.damage = weaponSpec.damage;
  updated.notice = `Cuoc chien da len cap ${nextWeaponLevel}. Sat thuong can chien tang manh.`;
  return updated;
};

export const advanceStage1975State = (state, delta) => {
  if (state.phase !== "playing") {
    return state;
  }

  const game = cloneState(state);
  game.player.attackCooldown = Math.max(0, game.player.attackCooldown - delta);
  game.player.attackPulse = Math.max(0, game.player.attackPulse - delta);
  game.soldiers = game.soldiers.map((soldier) => ({
    ...soldier,
    attackCooldown: Math.max(0, soldier.attackCooldown - delta),
  }));
  game.enemies = game.enemies.map((enemy) => ({
    ...enemy,
    attackCooldown: Math.max(0, enemy.attackCooldown - delta),
  }));
  game.coins = game.coins
    .map((coin) => ({
      ...coin,
      ttl: coin.ttl - delta,
    }))
    .filter((coin) => coin.ttl > 0);
  game.upkeepTimer = Math.max(0, game.upkeepTimer - delta);

  const farmSpec = getFarmSpec(game.farmLevel);

  game.plots.forEach((plot) => {
    plot.growDuration = farmSpec.growDuration;
    plot.yieldAmount = farmSpec.yieldAmount;

    if (plot.unlocked && plot.status === "growing") {
      plot.progress = Math.min(plot.growDuration, plot.progress + delta);
      if (plot.progress >= plot.growDuration) {
        plot.status = "ready";
      }
    }
  });

  if (game.upkeepTimer <= 0) {
    if (game.soldiersHired > 0) {
      const previousFood = game.food;
      game.food = Math.max(0, game.food - game.soldiersHired);
      if (previousFood > 0 && game.food === 0) {
        game.notice =
          "Kho luong da can. Nong dan va bo doi dang tam dung hoat dong.";
      }
    }
    game.upkeepTimer = STAGE_1975_UPKEEP_INTERVAL;
  }

  if (game.remainingWaveSpawns > 0) {
    game.waveSpawnTimer -= delta;
    if (game.waveSpawnTimer <= 0) {
      spawnEnemy(game);
    }
  }

  const movedPlayer = movePoint(
    game.player,
    { x: game.player.targetX, y: game.player.targetY },
    game.player.speed,
    delta,
  );
  game.player.x = movedPlayer.x;
  game.player.y = movedPlayer.y;

  if (game.player.intent?.type === "plot") {
    const targetPlot = game.plots.find(
      (plot) => plot.id === game.player.intent.plotId,
    );

    if (!targetPlot || !targetPlot.unlocked) {
      game.player.intent = null;
    } else if (getDistance(game.player, targetPlot) <= 24) {
      resolvePlotAction(game, targetPlot.id, "player");
      game.player.intent = null;
      game.player.targetX = game.player.x;
      game.player.targetY = game.player.y;
      game.player.currentPlotContactId = targetPlot.id;
    }
  }

  const contactPlot = getPlayerContactPlot(game);
  if (!game.player.intent && contactPlot) {
    if (game.player.currentPlotContactId !== contactPlot.id) {
      if (contactPlot.status === "empty" || contactPlot.status === "ready") {
        resolvePlotAction(game, contactPlot.id, "player");
      }
      game.player.currentPlotContactId = contactPlot.id;
    }
  } else if (!contactPlot) {
    game.player.currentPlotContactId = null;
  }

  if (game.farmer.hired) {
    if (game.food <= 0) {
      game.farmer.status = "Thieu luong thuc";
      game.farmer.targetPlotId = "";
    } else {
      const farmerPlot = chooseFarmerPlot(game);

      if (!farmerPlot) {
        const movedFarmer = movePoint(
          game.farmer,
          FARMER_HOME,
          FARMER_SPEED,
          delta,
        );
        game.farmer.x = movedFarmer.x;
        game.farmer.y = movedFarmer.y;
        game.farmer.targetPlotId = "";
        game.farmer.status = "Dang cho lenh";
      } else {
        const movedFarmer = movePoint(
          game.farmer,
          farmerPlot,
          FARMER_SPEED,
          delta,
        );
        game.farmer.x = movedFarmer.x;
        game.farmer.y = movedFarmer.y;
        game.farmer.targetPlotId = farmerPlot.id;

        if (getDistance(game.farmer, farmerPlot) <= 18) {
          resolvePlotAction(game, farmerPlot.id, "farmer");
        } else {
          game.farmer.status =
            farmerPlot.status === "ready"
              ? `Dang chay den ${farmerPlot.label}`
              : `Dang cham ${farmerPlot.label}`;
        }
      }
    }
  }

  const playerTargetIndex = selectNearestEnemyIndex(
    game.enemies,
    game.player,
    PLAYER_ATTACK_RANGE,
  );
  if (playerTargetIndex >= 0 && game.player.attackCooldown <= 0) {
    game.enemies[playerTargetIndex].hp -= game.player.damage;
    game.player.attackCooldown = PLAYER_ATTACK_COOLDOWN;
    game.player.attackPulse = 0.18;
  }

  if (game.food > 0) {
    game.soldiers.forEach((soldier) => {
      if (!soldier.active) {
        return;
      }

      const homePoint = {
        x: soldier.homeX ?? soldier.x,
        y: soldier.homeY ?? soldier.y,
      };
      const targetIndex = selectNearestEnemyIndex(
        game.enemies,
        soldier,
        SOLDIER_AGGRO_RANGE,
      );

      if (targetIndex < 0) {
        const movedSoldier = movePoint(
          soldier,
          homePoint,
          SOLDIER_MOVE_SPEED,
          delta,
        );
        soldier.x = movedSoldier.x;
        soldier.y = movedSoldier.y;
        return;
      }

      const targetEnemy = game.enemies[targetIndex];
      const distanceToEnemy = getDistance(soldier, targetEnemy);
      const retreatPoint = clampPointToRadius(
        homePoint,
        {
          x: soldier.x + (soldier.x - targetEnemy.x),
          y: soldier.y + (soldier.y - targetEnemy.y),
        },
        SOLDIER_HOME_LEASH,
      );
      const chasePoint = clampPointToRadius(homePoint, targetEnemy, SOLDIER_HOME_LEASH);

      if (distanceToEnemy > SOLDIER_HOLD_RANGE) {
        const movedSoldier = movePoint(
          soldier,
          chasePoint,
          SOLDIER_MOVE_SPEED,
          delta,
        );
        soldier.x = movedSoldier.x;
        soldier.y = movedSoldier.y;
      } else if (distanceToEnemy < SOLDIER_RETREAT_RANGE) {
        const movedSoldier = movePoint(
          soldier,
          retreatPoint,
          SOLDIER_MOVE_SPEED,
          delta,
        );
        soldier.x = movedSoldier.x;
        soldier.y = movedSoldier.y;
      } else if (getDistance(soldier, homePoint) > SOLDIER_HOME_LEASH) {
        const movedSoldier = movePoint(
          soldier,
          homePoint,
          SOLDIER_MOVE_SPEED,
          delta,
        );
        soldier.x = movedSoldier.x;
        soldier.y = movedSoldier.y;
      }

      if (soldier.attackCooldown > 0) {
        return;
      }

      if (targetIndex >= 0) {
        const refreshedDistance = getDistance(soldier, game.enemies[targetIndex]);
        if (refreshedDistance > SOLDIER_ATTACK_RANGE) {
          return;
        }

        game.enemies[targetIndex].hp -= 15;
        soldier.attackCooldown = SOLDIER_ATTACK_COOLDOWN;
      }
    });
  } else {
    game.soldiers.forEach((soldier) => {
      if (!soldier.active) {
        return;
      }

      const movedSoldier = movePoint(
        soldier,
        {
          x: soldier.homeX ?? soldier.x,
          y: soldier.homeY ?? soldier.y,
        },
        SOLDIER_MOVE_SPEED,
        delta,
      );
      soldier.x = movedSoldier.x;
      soldier.y = movedSoldier.y;
    });
  }

  removeDefeatedEnemies(game);

  const fenceWasStanding = state.fenceHp > 0;

  game.enemies.forEach((enemy) => {
    if (game.fenceHp > 0) {
      const fencePoint = getNearestFencePoint(enemy);
      const movedEnemy = movePoint(enemy, fencePoint, enemy.speed, delta);
      enemy.x = movedEnemy.x;
      enemy.y = movedEnemy.y;

      if (getDistance(enemy, fencePoint) <= 14 && enemy.attackCooldown <= 0) {
        game.fenceHp = Math.max(0, game.fenceHp - enemy.damage);
        enemy.attackCooldown = 1.05;
      }
      return;
    }

    const movedEnemy = movePoint(enemy, game.player, enemy.speed, delta);
    enemy.x = movedEnemy.x;
    enemy.y = movedEnemy.y;

    if (getDistance(enemy, game.player) <= 18 && enemy.attackCooldown <= 0) {
      game.player.hp = Math.max(0, game.player.hp - enemy.damage);
      enemy.attackCooldown = 0.96;
    }
  });

  if (fenceWasStanding && game.fenceHp === 0) {
    game.notice = "Hang rao da vo. Dich dang tran thang vao nong trai.";
  }

  if (game.player.hp <= 0) {
    game.phase = "defeat";
    game.notice = "Ban da nga xuong. Hay dung lai phong tuyen va thu lai.";
    return game;
  }

  collectNearbyCoins(game);

  if (isStage1975TutorialWave(game)) {
    if (hasCompletedStage1975Tutorial(game)) {
      game.wave = STAGE_1975_TUTORIAL_WAVE + 1;
      game.waveKills = 0;
      game.remainingWaveSpawns = getStage1975WaveEnemyCount(game.wave);
      game.waveSpawnTimer = 1.8;
      game.intermissionTimer = 0;
      game.notice =
        "Đã hoàn thành nhiệm vụ trồng lúa. Màn 2 bắt đầu, quân địch đang tiến về nông trại.";
    }

    return game;
  }

  if (game.remainingWaveSpawns === 0 && game.enemies.length === 0) {
    if (game.wave >= STAGE_1975_WAVE_TARGET) {
      game.phase = "victory";
      game.notice =
        "Phong tuyen 1975 da tru vung qua 10 wave. Ho so 1986 da mo duong.";
      return game;
    }

    if (state.intermissionTimer <= 0 && game.intermissionTimer <= 0) {
      game.intermissionTimer = 2.4;
      game.notice = `Wave ${game.wave} đã bị đẩy lùi. Chuẩn bị đợt kế tiếp ở biên giới Tây Nam.`;
      return game;
    }

    game.intermissionTimer = Math.max(0, game.intermissionTimer - delta);

    if (game.intermissionTimer === 0) {
      game.wave += 1;
      game.waveKills = 0;
      game.remainingWaveSpawns = getStage1975WaveEnemyCount(game.wave);
      game.waveSpawnTimer = 1.15;
      game.notice = getStage1975WaveStoryNotice(game.wave);
    }
  }

  return game;
};

export const STAGE_1975_RUNTIME = {
  STAGE_1975_ACTION_COSTS,
  STAGE_1975_SOLDIER_POSTS,
  STAGE_1975_WAVE_TARGET,
  STAGE_1975_WORLD,
};
