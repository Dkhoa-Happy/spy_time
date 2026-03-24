import Phaser from "phaser";

import {
  STAGE_1975_FENCE,
  STAGE_1975_PLOTS,
  STAGE_1975_WORLD,
  createStage1975InitialState,
} from "../lib/stage1975GameConfig";
import {
  STAGE_1975_PLAYER_FRAMES,
  STAGE_1975_SCENE_ASSETS,
} from "../lib/stage1975AssetManifest";
import {
  advanceStage1975State,
  forgeStage1975Hoe,
  getStage1975UiState,
  hireStage1975Farmer,
  hireStage1975Soldier,
  moveStage1975PlayerToPlot,
  moveStage1975PlayerToPoint,
  restartStage1975Room,
  unlockStage1975Plot,
  upgradeStage1975Farm,
  upgradeStage1975Fence,
} from "../lib/stage1975Runtime";

const BROADCAST_INTERVAL_MS = 100;
const PLOT_SIZE = 92;
const PLAYER_SCALE = 3.25;
const FARMER_SCALE = 3.1;
const SHOOTER_SCALE = 1.26;
const COIN_SCALE = 1.25;
const SOLDIER_VISUAL_RANGE = 380;
const RICE_TILE_SCALE = 2.15;
const RICE_SPRITE_OFFSETS = [
  [-28, -12],
  [-8, -8],
  [14, -11],
  [31, -3],
  [-16, 16],
  [8, 14],
];
const MOVE_BUTTON_TARGET_OFFSET = 52;

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const getDistance = (from, to) =>
  Math.hypot((to.x ?? 0) - (from.x ?? 0), (to.y ?? 0) - (from.y ?? 0));

const getNearestEnemy = (enemies, source, range = Number.POSITIVE_INFINITY) =>
  enemies.reduce(
    (nearest, enemy) => {
      const distance = getDistance(source, enemy);
      if (distance < nearest.distance && distance <= range) {
        return { enemy, distance };
      }

      return nearest;
    },
    { enemy: null, distance: range },
  ).enemy;

const getNearestFencePoint = (entity) => {
  const clampedX = Phaser.Math.Clamp(
    entity.x,
    STAGE_1975_FENCE.left,
    STAGE_1975_FENCE.right,
  );
  const clampedY = Phaser.Math.Clamp(
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

const getRiceStageKey = (plot, ratio) => {
  const { riceStageTiles, riceReadyTile } = STAGE_1975_SCENE_ASSETS.farm;

  if (!plot.unlocked || plot.status === "empty") {
    return null;
  }

  if (plot.status === "ready") {
    return riceReadyTile?.key ?? riceStageTiles[riceStageTiles.length - 1]?.key ?? null;
  }

  const stageIndex = Math.max(
    0,
    Math.min(riceStageTiles.length - 1, Math.floor(ratio * riceStageTiles.length)),
  );
  return riceStageTiles[stageIndex]?.key ?? null;
};

const getPlotVisual = (plot) => {
  if (!plot.unlocked) {
    return {
      soilTint: 0x56493d,
      border: 0x8e9496,
      status: "LOCKED",
      statusColor: "#d5e0e4",
      titleColor: "#c0cbc7",
      cropColor: 0x91a0a6,
      glowAlpha: 0,
      cropAlpha: 0,
      furrowAlpha: 0.38,
      patchAlpha: 0.75,
    };
  }

  if (plot.status === "ready") {
    return {
      soilTint: 0xa86e39,
      border: 0xffdc8c,
      status: "HARVEST",
      statusColor: "#fff6d5",
      titleColor: "#fff5db",
      cropColor: 0xf6c958,
      glowAlpha: 0.16,
      cropAlpha: 1,
      furrowAlpha: 0.2,
      patchAlpha: 1,
      progressTint: 0xffef9d,
    };
  }

  if (plot.status === "growing") {
    return {
      soilTint: 0x925a32,
      border: 0xb9efb1,
      status: "GROWING",
      statusColor: "#e4ffd4",
      titleColor: "#f4ffe0",
      cropColor: 0x67d34b,
      glowAlpha: 0.08,
      cropAlpha: 1,
      furrowAlpha: 0.24,
      patchAlpha: 1,
      progressTint: 0xcfffb8,
    };
  }

  return {
    soilTint: 0xa05f36,
    border: 0xe1b273,
    status: "SOW",
    statusColor: "#fff2dd",
    titleColor: "#fff0d3",
    cropColor: 0xc48f46,
    glowAlpha: 0.02,
    cropAlpha: 0,
    furrowAlpha: 0.34,
    patchAlpha: 1,
    progressTint: 0xf0dac2,
  };
};

const createPixelShadow = (scene, width, height, alpha = 0.24) =>
  scene.add.ellipse(0, 0, width, height, 0x000000, alpha).setOrigin(0.5);

const createHoeNode = (scene) => {
  const shaft = scene.add
    .rectangle(-1, 7, 4, 18, 0x8c5a34, 1)
    .setOrigin(0.5)
    .setStrokeStyle(1, 0x623d22, 1);
  const blade = scene.add
    .rectangle(4, -1, 15, 5, 0xe3e4e8, 1)
    .setOrigin(0.5)
    .setStrokeStyle(1, 0xa7a8b0, 1);
  const neck = scene.add
    .rectangle(0, -1, 5, 5, 0xcfced3, 1)
    .setOrigin(0.5)
    .setStrokeStyle(1, 0xa7a8b0, 1);

  return scene.add.container(10, -16, [shaft, neck, blade]);
};

const createActorNode = ({
  scene,
  spriteTexture,
  spriteFrame,
  scale,
  originY = 0.78,
  showHoe = false,
}) => {
  const shadow = createPixelShadow(scene, 28, 12);
  const swing = scene.add
    .arc(14, -14, 15, 210, 332, false, 0xdeab48, 0.2)
    .setStrokeStyle(3, 0xffefb7, 1)
    .setVisible(false);
  const hoe = showHoe ? createHoeNode(scene) : null;
  const sprite = scene.add
    .image(0, -12, spriteTexture, spriteFrame)
    .setOrigin(0.5, originY)
    .setScale(scale);
  const flash = scene.add
    .image(14, -22, STAGE_1975_SCENE_ASSETS.uiIcons.flash.key)
    .setScale(0.8)
    .setVisible(false);
  const containerChildren = [shadow, swing, sprite];
  if (hoe) {
    containerChildren.push(hoe);
  }
  containerChildren.push(flash);
  const container = scene.add.container(0, 0, containerChildren);

  return {
    container,
    shadow,
    sprite,
    swing,
    hoe,
    flash,
    flashTimer: 0,
    hitTimer: 0,
  };
};

const createShooterNode = ({ scene, textureKey, showHpBar = false }) => {
  const shadow = createPixelShadow(scene, 34, 14, 0.26);
  const sprite = scene.add
    .image(0, -10, textureKey)
    .setOrigin(0.5, 0.62)
    .setScale(SHOOTER_SCALE);
  const flash = scene.add
    .image(19, -14, STAGE_1975_SCENE_ASSETS.uiIcons.flash.key)
    .setScale(0.75)
    .setVisible(false);

  const hpBg = scene.add
    .rectangle(-17, -39, 34, 5, 0x1d0d0d, 0.7)
    .setOrigin(0, 0.5)
    .setVisible(showHpBar);
  const hpFill = scene.add
    .rectangle(-17, -39, 34, 5, 0xff9292, 1)
    .setOrigin(0, 0.5)
    .setVisible(showHpBar);

  const container = scene.add.container(0, 0, [shadow, sprite, flash, hpBg, hpFill]);

  return {
    container,
    shadow,
    sprite,
    flash,
    hpFill,
    flashTimer: 0,
    hitTimer: 0,
  };
};

const createCoinNode = (scene) => {
  const glow = scene.add.circle(0, 0, 15, 0xffe39a, 0.18);
  const sprite = scene.add
    .image(0, 0, STAGE_1975_SCENE_ASSETS.uiIcons.coin.key)
    .setScale(COIN_SCALE);

  return scene.add.container(0, 0, [glow, sprite]);
};

const createGrassFloorTiles = (
  scene,
  left,
  top,
  width,
  height,
  { depth = -6, alpha = 1 } = {},
) => {
  const { grassTiles } = STAGE_1975_SCENE_ASSETS.farm;
  const tileSize = 64;
  const cols = Math.ceil(width / tileSize) + 1;
  const rows = Math.ceil(height / tileSize) + 1;
  const tintVariants = [0xffffff, 0xf2fff0, 0xe7ffe3, 0xf8fff7];

  return Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const grassTile = grassTiles[(col + row * 2) % grassTiles.length];

    return scene.add
      .image(left + 32 + col * tileSize, top + 32 + row * tileSize, grassTile.key)
      .setOrigin(0.5)
      .setDepth(depth)
      .setAlpha(alpha)
      .setTint(tintVariants[(row + col) % tintVariants.length]);
  });
};

export class Stage1975PhaserScene extends Phaser.Scene {
  constructor({ onStateChange, onSceneReady } = {}) {
    super("stage-1975-phaser");
    this.onStateChange = onStateChange;
    this.onSceneReady = onSceneReady;
    this.gameState = createStage1975InitialState();
    this.broadcastElapsed = 0;
    this.frameDeltaSeconds = 0;
    this.plotNodes = new Map();
    this.enemyNodes = new Map();
    this.coinNodes = new Map();
    this.activeEffects = [];
    this.keyboardMoveActive = false;
    this.isGameplayPaused = false;
  }

  preload() {
    const { playerSheet, characters, farm, uiIcons } = STAGE_1975_SCENE_ASSETS;
    const farmAssets = Object.values(farm).flatMap((asset) =>
      Array.isArray(asset) ? asset : [asset],
    );

    this.load.spritesheet(playerSheet.key, playerSheet.src, {
      frameWidth: playerSheet.frameWidth,
      frameHeight: playerSheet.frameHeight,
      spacing: playerSheet.spacing,
      margin: playerSheet.margin,
    });

    [...Object.values(characters), ...farmAssets, ...Object.values(uiIcons)].forEach(
      (asset) => {
        this.load.image(asset.key, asset.src);
      },
    );
  }

  create() {
    this.cameras.main.setBackgroundColor("#0f150f");
    this.cameras.main.roundPixels = true;

    this.createBackdrop();
    this.createFence();
    this.createPlotNodes();
    this.createHud();
    this.createUnits();
    this.createInput();
    this.renderScene(true);

    this.onSceneReady?.({
      restart: () => this.applyState(restartStage1975Room),
      unlockPlot: () => this.applyState(unlockStage1975Plot),
      upgradeFarm: () => this.applyState(upgradeStage1975Farm),
      hireFarmer: () => this.applyState(hireStage1975Farmer),
      hireSoldier: () => this.applyState(hireStage1975Soldier),
      upgradeFence: () => this.applyState(upgradeStage1975Fence),
      forgeHoe: () => this.applyState(forgeStage1975Hoe),
      pauseGameplay: () => {
        this.isGameplayPaused = true;
      },
      resumeGameplay: () => {
        this.isGameplayPaused = false;
      },
    });
  }

  createBackdrop() {
    const centerX = STAGE_1975_WORLD.width / 2;
    const centerY = STAGE_1975_WORLD.height / 2;
    const fenceWidth = STAGE_1975_FENCE.right - STAGE_1975_FENCE.left;
    const fenceHeight = STAGE_1975_FENCE.bottom - STAGE_1975_FENCE.top;
    const farmAssets = STAGE_1975_SCENE_ASSETS.farm;

    this.add.rectangle(
      centerX,
      centerY,
      STAGE_1975_WORLD.width,
      STAGE_1975_WORLD.height,
      0x23421c,
    ).setDepth(-10);

    this.outerGround = this.add
      .tileSprite(
        centerX,
        centerY,
        STAGE_1975_WORLD.width,
        STAGE_1975_WORLD.height,
        farmAssets.grassTiles[0].key,
      )
      .setTint(0xdefdd6)
      .setAlpha(0.74)
      .setDepth(-7);
    this.outerGround.tilePositionX = 18;
    this.outerGround.tilePositionY = 9;

    this.innerGrassTiles = createGrassFloorTiles(
      this,
      STAGE_1975_FENCE.left,
      STAGE_1975_FENCE.top,
      fenceWidth,
      fenceHeight,
      {
        depth: -6,
        alpha: 0.98,
      },
    );

    this.innerGroundDetail = this.add
      .tileSprite(centerX, centerY, fenceWidth, fenceHeight, farmAssets.grassTiles[3].key)
      .setTint(0xffffff)
      .setAlpha(0.08)
      .setDepth(-5.2);
    this.innerGroundDetail.tilePositionX = 29;
    this.innerGroundDetail.tilePositionY = 35;

    this.add
      .circle(300, 190, 96, 0xa9dc74, 0.12)
      .setDepth(-4);
    this.add
      .circle(730, 410, 118, 0x96d363, 0.14)
      .setDepth(-4);
    this.add
      .circle(560, 170, 66, 0xc9f18d, 0.1)
      .setDepth(-4);

    this.add
      .tileSprite(500, 266, 520, 20, farmAssets.grassTiles[2].key)
      .setTint(0xe9ffe1)
      .setAlpha(0.22)
      .setDepth(-3);

    this.add
      .tileSprite(500, 510, 640, 24, farmAssets.grassTiles[3].key)
      .setTint(0xe9ffe1)
      .setAlpha(0.2)
      .setDepth(-1);

    this.groundGlow = this.add.circle(500, 460, 28, 0xbff5b6, 0.14).setDepth(4);
  }

  createFence() {
    const width = STAGE_1975_FENCE.right - STAGE_1975_FENCE.left;
    const height = STAGE_1975_FENCE.bottom - STAGE_1975_FENCE.top;
    const [fenceTile1, fenceTile2, fenceTile3, fenceTile4] =
      STAGE_1975_SCENE_ASSETS.farm.fenceTiles;
    const midX = (STAGE_1975_FENCE.left + STAGE_1975_FENCE.right) / 2;
    const midY = (STAGE_1975_FENCE.top + STAGE_1975_FENCE.bottom) / 2;
    const fenceDepth = 2.6;

    this.fenceStrips = {
      top: this.add
        .tileSprite(
          midX,
          STAGE_1975_FENCE.top - 7,
          width + 32,
          20,
          fenceTile1.key,
        )
        .setDepth(fenceDepth),
      bottom: this.add
        .tileSprite(
          midX,
          STAGE_1975_FENCE.bottom + 7,
          width + 32,
          20,
          fenceTile3.key,
        )
        .setDepth(fenceDepth),
      left: this.add
        .tileSprite(
          STAGE_1975_FENCE.left - 8,
          midY,
          height + 30,
          20,
          fenceTile2.key,
        )
        .setAngle(90)
        .setDepth(fenceDepth),
      right: this.add
        .tileSprite(
          STAGE_1975_FENCE.right + 8,
          midY,
          height + 30,
          20,
          fenceTile4.key,
        )
        .setAngle(90)
        .setDepth(fenceDepth),
    };

    this.waveBadge = this.add
      .text(24, 20, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "700",
        color: "#efffe1",
        backgroundColor: "#1d2b19",
        padding: { x: 12, y: 8 },
      })
      .setDepth(10);

    this.fenceHudLabel = this.add
      .text(STAGE_1975_WORLD.width - 240, 20, "FENCE", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d4f0d1",
      })
      .setDepth(10);

    this.fenceHudValue = this.add
      .text(STAGE_1975_WORLD.width - 240, 42, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "700",
        color: "#ffffff",
      })
      .setDepth(10);

    this.fenceHudBarBg = this.add
      .rectangle(STAGE_1975_WORLD.width - 240, 72, 190, 10, 0x111715, 0.85)
      .setOrigin(0, 0.5)
      .setDepth(10);

    this.fenceHudBarFill = this.add
      .rectangle(STAGE_1975_WORLD.width - 240, 72, 190, 10, 0x72ef87, 1)
      .setOrigin(0, 0.5)
      .setDepth(10);
  }

  createPlotNodes() {
    STAGE_1975_PLOTS.forEach((plot) => {
      const patchShadow = this.add.ellipse(
        plot.x,
        plot.y + 32,
        PLOT_SIZE + 24,
        24,
        0x000000,
        0.18,
      ).setDepth(0.15);
      const frame = this.add
        .rectangle(plot.x, plot.y + 4, PLOT_SIZE + 16, PLOT_SIZE + 12, 0x503218, 0.55)
        .setStrokeStyle(2, 0xc89b56, 0.72)
        .setDepth(0.24);
      const patch = this.add
        .tileSprite(plot.x, plot.y + 4, PLOT_SIZE, PLOT_SIZE, STAGE_1975_SCENE_ASSETS.farm.dirtTile.key)
        .setOrigin(0.5)
        .setDepth(0.32);
      const border = this.add
        .rectangle(plot.x, plot.y + 4, PLOT_SIZE + 8, PLOT_SIZE + 8)
        .setStrokeStyle(3, 0xe5b174, 0.95)
        .setDepth(0.96);
      const highlight = this.add
        .rectangle(plot.x, plot.y - 14, PLOT_SIZE - 8, 18, 0xffffff, 0.08)
        .setDepth(0.98);
      const furrows = Array.from({ length: 4 }, (_, index) =>
        this.add
          .rectangle(plot.x, plot.y - 18 + index * 18, PLOT_SIZE - 20, 5, 0x5b3119, 0.24)
          .setOrigin(0.5)
          .setDepth(0.4),
      );
      const patchGlow = this.add.circle(plot.x, plot.y + 2, 50, 0xdaf5a4, 0).setDepth(0.56);

      const riceSprites = RICE_SPRITE_OFFSETS.map(([offsetX, offsetY], index) =>
        this.add
          .image(
            plot.x + offsetX,
            plot.y + offsetY,
            STAGE_1975_SCENE_ASSETS.farm.riceStageTiles[0].key,
          )
          .setScale(RICE_TILE_SCALE + (index % 3) * 0.08)
          .setOrigin(0.5, 0.92)
          .setDepth(0.78)
          .setVisible(false),
      );

      const hitArea = this.add
        .rectangle(plot.x, plot.y + 4, PLOT_SIZE + 18, PLOT_SIZE + 16, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      hitArea.setData("plotId", plot.id);
      hitArea.on("pointerdown", (pointer, _localX, _localY, event) => {
        event.stopPropagation();
        this.applyState((state) => moveStage1975PlayerToPlot(state, plot.id));
      });

      const title = this.add
        .text(plot.x, plot.y - 68, plot.label.toUpperCase(), {
          fontFamily: "monospace",
          fontSize: "11px",
          fontStyle: "700",
          color: "#fff6d9",
        })
        .setOrigin(0.5)
        .setDepth(1.12);

      const status = this.add
        .text(plot.x, plot.y + 58, "", {
          fontFamily: "monospace",
          fontSize: "12px",
          fontStyle: "700",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(1.12);

      const progressBg = this.add
        .rectangle(plot.x - 32, plot.y + 74, 64, 6, 0x0b100a, 0.48)
        .setOrigin(0, 0.5)
        .setDepth(1.1);
      const progressFill = this.add
        .rectangle(plot.x - 32, plot.y + 74, 0, 6, 0xf5ecaa, 0.98)
        .setOrigin(0, 0.5)
        .setDepth(1.11);

      const lockIcon = this.add
        .image(plot.x, plot.y + 4, STAGE_1975_SCENE_ASSETS.uiIcons.flash.key)
        .setScale(0.82)
        .setTint(0xa9b7bb)
        .setAlpha(0.9)
        .setDepth(1.02);

      this.plotNodes.set(plot.id, {
        patchShadow,
        frame,
        patch,
        border,
        highlight,
        furrows,
        patchGlow,
        riceSprites,
        hitArea,
        title,
        status,
        progressBg,
        progressFill,
        lockIcon,
      });
    });
  }

  createHud() {
    this.noticePanel = this.add
      .rectangle(500, 586, 934, 42, 0x0b130d, 0.56)
      .setStrokeStyle(1, 0x9ac58c, 0.22)
      .setDepth(10);

    this.noticeText = this.add
      .text(500, 586, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#edf9e5",
        align: "center",
        wordWrap: { width: 860, useAdvancedWrap: true },
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  createUnits() {
    this.playerNode = createActorNode({
      scene: this,
      spriteTexture: STAGE_1975_SCENE_ASSETS.playerSheet.key,
      spriteFrame: STAGE_1975_PLAYER_FRAMES.player.idle[0],
      scale: PLAYER_SCALE,
      showHoe: true,
    });
    this.playerNode.container.setDepth(6);

    this.farmerNode = createActorNode({
      scene: this,
      spriteTexture: STAGE_1975_SCENE_ASSETS.playerSheet.key,
      spriteFrame: STAGE_1975_PLAYER_FRAMES.farmer.idle[0],
      scale: FARMER_SCALE,
    });
    this.farmerNode.container.setDepth(5.5);
    this.farmerNode.sprite.setTint(0xc8f1c0);

    this.soldierNodes = this.gameState.soldiers.map((soldier) => {
      const node = createShooterNode({
        scene: this,
        textureKey: STAGE_1975_SCENE_ASSETS.characters.soldierStand.key,
      });
      node.container.setPosition(soldier.x, soldier.y);
      node.container.setDepth(5.5);
      return node;
    });
  }

  createInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      });
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.D,
      ]);
    }

    this.input.on("pointerdown", (pointer, targets) => {
      if (targets.some((target) => target?.getData?.("plotId"))) {
        return;
      }

      this.applyState((state) =>
        moveStage1975PlayerToPoint(state, {
          x: pointer.worldX,
          y: pointer.worldY,
        }),
      );
    });
  }

  applyState(transform) {
    this.gameState = transform(this.gameState);
    this.frameDeltaSeconds = 0;
    this.renderScene(true);
  }

  getKeyboardMoveDirection() {
    if (!this.cursors || !this.wasdKeys) {
      return null;
    }

    const left = this.cursors.left.isDown || this.wasdKeys.left.isDown;
    const right = this.cursors.right.isDown || this.wasdKeys.right.isDown;
    const up = this.cursors.up.isDown || this.wasdKeys.up.isDown;
    const down = this.cursors.down.isDown || this.wasdKeys.down.isDown;

    const x = Number(right) - Number(left);
    const y = Number(down) - Number(up);

    if (x === 0 && y === 0) {
      return null;
    }

    const length = Math.hypot(x, y) || 1;
    return {
      x: x / length,
      y: y / length,
    };
  }

  syncKeyboardMovementTarget() {
    if (this.gameState.phase !== "playing") {
      this.keyboardMoveActive = false;
      return;
    }

    const direction = this.getKeyboardMoveDirection();
    if (!direction) {
      if (this.keyboardMoveActive) {
        this.gameState = {
          ...this.gameState,
          player: {
            ...this.gameState.player,
            targetX: this.gameState.player.x,
            targetY: this.gameState.player.y,
            intent: null,
          },
        };
      }
      this.keyboardMoveActive = false;
      return;
    }

    this.keyboardMoveActive = true;
    this.gameState = {
      ...this.gameState,
      player: {
        ...this.gameState.player,
        targetX: Phaser.Math.Clamp(
          this.gameState.player.x + direction.x * MOVE_BUTTON_TARGET_OFFSET,
          20,
          STAGE_1975_WORLD.width - 20,
        ),
        targetY: Phaser.Math.Clamp(
          this.gameState.player.y + direction.y * MOVE_BUTTON_TARGET_OFFSET,
          20,
          STAGE_1975_WORLD.height - 20,
        ),
        intent: null,
      },
    };
  }

  spawnBulletEffect(from, to, color) {
    if (!from || !to) {
      return;
    }

    const start = { x: from.x, y: from.y - 10 };
    const end = { x: to.x, y: to.y - 8 };
    const muzzle = this.add
      .circle(start.x, start.y, 5, color, 0.85)
      .setDepth(10);
    const flash = this.add
      .image(start.x, start.y, STAGE_1975_SCENE_ASSETS.uiIcons.flash.key)
      .setScale(0.82)
      .setTint(color)
      .setDepth(10);
    const bullet = this.add
      .circle(start.x, start.y, 3, color, 1)
      .setDepth(10.5);
    const trail = this.add
      .rectangle(start.x, start.y, 10, 2, color, 0.6)
      .setDepth(9.5);

    this.activeEffects.push({
      duration: 0.2,
      ttl: 0.2,
      objects: [muzzle, flash, bullet, trail],
      update: (progress) => {
        const traveled = 1 - progress;
        bullet.x = Phaser.Math.Linear(start.x, end.x, traveled);
        bullet.y = Phaser.Math.Linear(start.y, end.y, traveled);
        trail.x = Phaser.Math.Linear(start.x, end.x, Math.max(0, traveled - 0.06));
        trail.y = Phaser.Math.Linear(start.y, end.y, Math.max(0, traveled - 0.06));
        trail.width = 14 + traveled * 6;
        trail.rotation = Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y);
        trail.setAlpha(progress * 0.75);
        bullet.setAlpha(progress);
        muzzle.setAlpha(progress * 0.55);
        muzzle.setScale(1 + traveled * 0.9);
        flash.setScale(0.82 + traveled * 0.45);
        flash.setAlpha(progress);
      },
    });
  }

  spawnCoinBurst(x, y) {
    const sparkle = this.add
      .image(x, y - 6, STAGE_1975_SCENE_ASSETS.uiIcons.coin.key)
      .setScale(0.95)
      .setDepth(10);

    this.activeEffects.push({
      duration: 0.28,
      ttl: 0.28,
      objects: [sparkle],
      update: (progress) => {
        sparkle.setAlpha(progress);
        sparkle.y -= 0.6;
        sparkle.setScale(0.9 + (1 - progress) * 0.55);
      },
    });
  }

  captureCombatPresentation(previousState, nextState) {
    if (
      previousState.player.attackPulse <= 0 &&
      nextState.player.attackPulse > previousState.player.attackPulse
    ) {
      this.playerNode.flashTimer = 0.12;
    }

    if (nextState.player.hp < previousState.player.hp) {
      this.playerNode.hitTimer = 0.24;
      this.cameras.main.shake(120, 0.0022);
    }

    const previousEnemies = new Map(previousState.enemies.map((enemy) => [enemy.id, enemy]));
    const nextEnemies = new Map(nextState.enemies.map((enemy) => [enemy.id, enemy]));

    nextState.enemies.forEach((enemy) => {
      const previousEnemy = previousEnemies.get(enemy.id);
      if (!previousEnemy) {
        return;
      }

      if (enemy.hp < previousEnemy.hp) {
        const node = this.enemyNodes.get(enemy.id);
        if (node) {
          node.hitTimer = 0.16;
        }
      }
    });

    previousState.enemies.forEach((enemy) => {
      if (!nextEnemies.has(enemy.id) && enemy.hp > 0) {
        this.spawnCoinBurst(enemy.x, enemy.y);
      }
    });

    nextState.soldiers.forEach((soldier, index) => {
      const previousSoldier = previousState.soldiers[index];
      if (
        !soldier.active ||
        !previousSoldier ||
        soldier.attackCooldown <= previousSoldier.attackCooldown
      ) {
        return;
      }

      const target =
        getNearestEnemy(previousState.enemies, soldier, SOLDIER_VISUAL_RANGE) ??
        getNearestEnemy(nextState.enemies, soldier, SOLDIER_VISUAL_RANGE);

      if (target) {
        this.spawnBulletEffect(soldier, target, 0x8fe9ff);
      }

      const node = this.soldierNodes[index];
      if (node) {
        node.flashTimer = 0.12;
      }
    });

    if (previousState.fenceHp > 0 && nextState.fenceHp === 0) {
      this.cameras.main.shake(220, 0.004);
    }
  }

  updateActiveEffects(delta) {
    this.activeEffects = this.activeEffects.filter((effect) => {
      effect.ttl -= delta;
      const progress = clamp01(effect.ttl / effect.duration);

      effect.update?.(progress);

      if (effect.ttl <= 0) {
        effect.objects.forEach((object) => object.destroy());
        return false;
      }

      return true;
    });
  }

  syncEnemies() {
    const activeIds = new Set(this.gameState.enemies.map((enemy) => enemy.id));

    this.enemyNodes.forEach((node, id) => {
      if (!activeIds.has(id)) {
        node.container.destroy();
        this.enemyNodes.delete(id);
      }
    });

    this.gameState.enemies.forEach((enemy) => {
      let node = this.enemyNodes.get(enemy.id);
      if (!node) {
        node = createShooterNode({
          scene: this,
          textureKey: STAGE_1975_SCENE_ASSETS.characters.enemyStand.key,
          showHpBar: true,
        });
        node.container.setDepth(5);
        this.enemyNodes.set(enemy.id, node);
      }

      const target =
        this.gameState.fenceHp > 0 ? getNearestFencePoint(enemy) : this.gameState.player;
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, target.x, target.y);
      const bob = Math.sin(this.time.now / 140 + Number(enemy.id.replace("enemy-", ""))) * 2.4;

      node.flashTimer = Math.max(0, node.flashTimer - this.frameDeltaSeconds);
      node.hitTimer = Math.max(0, node.hitTimer - this.frameDeltaSeconds);

      node.container.setPosition(enemy.x, enemy.y + bob);
      node.container.setRotation(angle);
      node.container.setDepth(5 + enemy.y / 1000);
      node.sprite.setTexture(
        enemy.attackCooldown > 0.74
          ? STAGE_1975_SCENE_ASSETS.characters.enemyAttack.key
          : STAGE_1975_SCENE_ASSETS.characters.enemyStand.key,
      );
      node.flash.setVisible(false);
      node.hpFill.width = Math.max(0, 34 * (enemy.hp / enemy.maxHp));

      if (node.hitTimer > 0) {
        node.sprite.setTint(0xffb5b5);
      } else {
        node.sprite.clearTint();
      }
    });
  }

  syncCoins() {
    const activeIds = new Set(this.gameState.coins.map((coin) => coin.id));

    this.coinNodes.forEach((node, id) => {
      if (!activeIds.has(id)) {
        node.destroy();
        this.coinNodes.delete(id);
      }
    });

    this.gameState.coins.forEach((coin) => {
      let node = this.coinNodes.get(coin.id);
      if (!node) {
        node = createCoinNode(this);
        node.setDepth(4.8);
        this.coinNodes.set(coin.id, node);
      }

      node.setPosition(coin.x, coin.y - 6 + Math.sin(this.time.now / 160 + coin.value) * 3);
      node.setScale(1 + Math.sin(this.time.now / 180 + coin.value) * 0.03);
    });
  }

  syncPlots() {
    this.gameState.plots.forEach((plot) => {
      const node = this.plotNodes.get(plot.id);
      if (!node) {
        return;
      }

      const visual = getPlotVisual(plot);
      const ratio = !plot.unlocked
        ? 0
        : plot.status === "ready"
          ? 1
          : plot.growDuration > 0
            ? plot.progress / plot.growDuration
            : 0;

      node.patch.setTint(visual.soilTint);
      node.patch.setAlpha(visual.patchAlpha);
      node.patch.setScale(1);
      node.border.setStrokeStyle(3, visual.border, 0.95);
      node.frame.setStrokeStyle(2, visual.border, plot.unlocked ? 0.78 : 0.35);
      node.highlight.setAlpha(plot.unlocked ? 0.1 : 0.03);
      node.patchGlow.setAlpha(visual.glowAlpha);
      node.patchGlow.setFillStyle(visual.cropColor, visual.glowAlpha);
      node.status.setText(visual.status);
      node.status.setColor(visual.statusColor);
      node.title.setColor(visual.titleColor);
      node.progressBg.setVisible(plot.unlocked);
      node.progressFill.setVisible(plot.unlocked);
      node.progressFill.width = 64 * ratio;
      node.progressFill.fillColor = visual.progressTint;
      node.lockIcon.setVisible(!plot.unlocked);
      node.furrows.forEach((furrow, index) => {
        furrow.setAlpha(visual.furrowAlpha);
        furrow.setPosition(plot.x, plot.y - 18 + index * 18);
        furrow.width = plot.unlocked ? PLOT_SIZE - 18 : PLOT_SIZE - 28;
      });

      const riceStageKey = getRiceStageKey(plot, ratio);
      node.riceSprites.forEach((riceSprite, index) => {
        const sway = Math.sin(this.time.now / 240 + index * 0.68 + plot.x * 0.01) * 1.35;
        const bob = Math.sin(this.time.now / 300 + index * 0.55) * 0.9;
        const stageScale =
          plot.status === "ready"
            ? 2.42
            : plot.status === "growing"
              ? 1.7 + ratio * 0.6
              : RICE_TILE_SCALE;

        riceSprite.setVisible(Boolean(riceStageKey));
        if (!riceStageKey) {
          return;
        }

        riceSprite.setTexture(riceStageKey);
        riceSprite.setPosition(
          plot.x + RICE_SPRITE_OFFSETS[index][0] + sway,
          plot.y + RICE_SPRITE_OFFSETS[index][1] + bob,
        );
        riceSprite.setScale(stageScale + (index % 3) * 0.06);
        riceSprite.setAlpha(plot.status === "ready" ? 1 : 0.96);
        riceSprite.setTint(
          plot.status === "ready"
            ? 0xfff5ba
            : plot.status === "growing"
              ? 0xeaffd5
              : 0xffffff,
        );
      });
    });
  }

  syncFence() {
    const hpRatio = clamp01(this.gameState.fenceHp / this.gameState.fenceMaxHp);
    const fenceTint = this.gameState.fenceHp > 0 ? 0xffffff : 0xffb7b7;

    Object.values(this.fenceStrips).forEach((strip) => {
      strip.setTint(fenceTint);
      strip.setAlpha(this.gameState.fenceHp > 0 ? 1 : 0.74);
    });

    const totalEnemies =
      this.gameState.remainingWaveSpawns + this.gameState.enemies.length;
    this.waveBadge.setText(
      this.gameState.wave === 1
        ? `WAVE 1/10  |  TUTORIAL · ${totalEnemies} ENEMIES`
        : `WAVE ${this.gameState.wave}/10  |  ${totalEnemies} ENEMIES`,
    );
    this.fenceHudValue.setText(
      `${Math.max(0, Math.round(this.gameState.fenceHp))} / ${this.gameState.fenceMaxHp}`,
    );
    this.fenceHudBarFill.width = 190 * hpRatio;
    this.fenceHudBarFill.fillColor =
      this.gameState.fenceHp > 0 ? 0x72ef87 : 0xf87171;
  }

  syncUnits() {
    const playerMoving =
      Phaser.Math.Distance.Between(
        this.gameState.player.x,
        this.gameState.player.y,
        this.gameState.player.targetX,
        this.gameState.player.targetY,
      ) > 6;

    this.playerNode.flashTimer = Math.max(0, this.playerNode.flashTimer - this.frameDeltaSeconds);
    this.playerNode.hitTimer = Math.max(0, this.playerNode.hitTimer - this.frameDeltaSeconds);

    this.playerNode.container.setPosition(this.gameState.player.x, this.gameState.player.y);
    this.playerNode.container.setDepth(6 + this.gameState.player.y / 1000);
    this.groundGlow.setPosition(this.gameState.player.x, this.gameState.player.y + 8);
    this.playerNode.flash.setVisible(this.playerNode.flashTimer > 0);
    this.playerNode.flash.setAlpha(clamp01(this.playerNode.flashTimer / 0.12));
    this.playerNode.sprite.setFrame(STAGE_1975_PLAYER_FRAMES.player.idle[0]);
    const facingLeft = this.gameState.player.targetX < this.gameState.player.x;
    const moveSway = playerMoving ? Math.sin(this.time.now / 88) : 0;
    this.playerNode.sprite.setFlipX(facingLeft);
    this.playerNode.shadow.setScale(playerMoving ? 1.1 : 1, playerMoving ? 1 : 0.92);
    this.playerNode.sprite.y = -12 + (playerMoving ? Math.sin(this.time.now / 95) * 2.6 : 0);
    if (this.playerNode.hoe) {
      this.playerNode.hoe.setPosition(
        facingLeft ? -10 - moveSway * 1.6 : 10 + moveSway * 1.6,
        (playerMoving ? -15 : -16) + moveSway * 1.2,
      );
      this.playerNode.hoe.setScale(facingLeft ? -1 : 1, 1);
      this.playerNode.hoe.setRotation(
        (facingLeft ? Phaser.Math.DegToRad(-18) : Phaser.Math.DegToRad(18)) +
          moveSway * 0.12,
      );
      this.playerNode.hoe.setAlpha(1);
    }

    if (this.playerNode.hitTimer > 0) {
      this.playerNode.sprite.setTint(0xffc9c9);
    } else {
      this.playerNode.sprite.clearTint();
    }

    const playerAttackTarget = getNearestEnemy(this.gameState.enemies, this.gameState.player, 90);
    if (this.gameState.player.attackPulse > 0 && playerAttackTarget) {
      const angle = Phaser.Math.Angle.Between(
        this.gameState.player.x,
        this.gameState.player.y,
        playerAttackTarget.x,
        playerAttackTarget.y,
      );
      this.playerNode.swing.setVisible(true);
      this.playerNode.swing.setPosition(Math.cos(angle) * 16, -12 + Math.sin(angle) * 16);
      this.playerNode.swing.setRotation(angle + Math.PI / 2);
      this.playerNode.swing.setScale(1 + this.gameState.player.attackPulse * 0.5);
      this.playerNode.swing.setAlpha(0.72);
      if (this.playerNode.hoe) {
        const attackReach = 11 + this.gameState.player.attackPulse * 22;
        this.playerNode.hoe.setPosition(
          Math.cos(angle) * attackReach,
          -13 + Math.sin(angle) * attackReach,
        );
        this.playerNode.hoe.setRotation(
          angle + Math.PI / 2.2 + this.gameState.player.attackPulse * 0.5,
        );
      }
    } else {
      this.playerNode.swing.setVisible(false);
    }

    this.farmerNode.flashTimer = Math.max(0, this.farmerNode.flashTimer - this.frameDeltaSeconds);
    this.farmerNode.hitTimer = Math.max(0, this.farmerNode.hitTimer - this.frameDeltaSeconds);
    this.farmerNode.container.setVisible(this.gameState.farmer.hired);

    if (this.gameState.farmer.hired) {
      const farmerMoving =
        Phaser.Math.Distance.Between(
          this.gameState.farmer.x,
          this.gameState.farmer.y,
          this.gameState.player.targetX,
          this.gameState.player.targetY,
        ) > 6 && this.gameState.farmer.status !== "Dang cho lenh";

      this.farmerNode.container.setPosition(this.gameState.farmer.x, this.gameState.farmer.y);
      this.farmerNode.container.setDepth(5.5 + this.gameState.farmer.y / 1000);
      this.farmerNode.flash.setVisible(false);
      this.farmerNode.swing.setVisible(false);
      this.farmerNode.sprite.setFrame(STAGE_1975_PLAYER_FRAMES.farmer.idle[0]);
      this.farmerNode.sprite.setFlipX(
        this.gameState.farmer.targetPlotId
          ? this.gameState.farmer.x > this.gameState.player.x
          : false,
      );
      this.farmerNode.shadow.setScale(farmerMoving ? 1.08 : 1, farmerMoving ? 0.98 : 0.9);
      this.farmerNode.sprite.y = -12 + (farmerMoving ? Math.sin(this.time.now / 100 + 0.6) * 2.2 : 0);

      if (this.gameState.food > 0) {
        this.farmerNode.sprite.setTint(0xc8f1c0);
      } else {
        this.farmerNode.sprite.setTint(this.gameState.food > 0 ? 0xc8f1c0 : 0x8d9891);
      }
    }

    this.gameState.soldiers.forEach((soldier, index) => {
      const node = this.soldierNodes[index];
      node.flashTimer = Math.max(0, node.flashTimer - this.frameDeltaSeconds);
      node.hitTimer = Math.max(0, node.hitTimer - this.frameDeltaSeconds);
      node.container.setVisible(soldier.active);

      if (!soldier.active) {
        return;
      }

      const targetEnemy = getNearestEnemy(
        this.gameState.enemies,
        soldier,
        SOLDIER_VISUAL_RANGE,
      );
      const angle = targetEnemy
        ? Phaser.Math.Angle.Between(soldier.x, soldier.y, targetEnemy.x, targetEnemy.y)
        : -Math.PI / 2;
      const patrolBob = Math.sin(this.time.now / 130 + index * 0.8) * 2;

      node.container.setPosition(soldier.x, soldier.y + patrolBob);
      node.container.setRotation(angle);
      node.container.setDepth(5.4 + soldier.y / 1000);
      node.flash.setVisible(node.flashTimer > 0);
      node.flash.setAlpha(clamp01(node.flashTimer / 0.12));
      node.sprite.setTexture(
        node.flashTimer > 0
          ? STAGE_1975_SCENE_ASSETS.characters.soldierAttack.key
          : STAGE_1975_SCENE_ASSETS.characters.soldierStand.key,
      );

      if (this.gameState.food > 0) {
        node.sprite.clearTint();
        node.sprite.setAlpha(1);
        node.shadow.setScale(1.06, 0.96);
      } else {
        node.sprite.setTint(0x8e9396);
        node.sprite.setAlpha(0.75);
        node.shadow.setScale(1, 0.92);
      }
    });
  }

  renderScene(forceBroadcast = false) {
    this.syncFence();
    this.syncPlots();
    this.syncUnits();
    this.syncEnemies();
    this.syncCoins();
    this.noticeText.setText(this.gameState.notice);

    if (forceBroadcast) {
      this.broadcastElapsed = 0;
      this.onStateChange?.(getStage1975UiState(this.gameState));
    }
  }

  update(_time, delta) {
    if (this.isGameplayPaused) {
      this.frameDeltaSeconds = 0;
      return;
    }

    const cappedDelta = Math.min(delta, 100) / 1000;
    this.syncKeyboardMovementTarget();
    const previousState = this.gameState;
    const previousPhase = this.gameState.phase;
    const previousNotice = this.gameState.notice;
    const nextState = advanceStage1975State(this.gameState, cappedDelta);

    this.frameDeltaSeconds = cappedDelta;
    this.captureCombatPresentation(previousState, nextState);
    this.gameState = nextState;
    if (this.gameState.phase !== "playing") {
      this.keyboardMoveActive = false;
    }
    this.updateActiveEffects(cappedDelta);
    this.renderScene(false);

    this.broadcastElapsed += delta;
    if (
      this.broadcastElapsed >= BROADCAST_INTERVAL_MS ||
      previousPhase !== this.gameState.phase ||
      previousNotice !== this.gameState.notice
    ) {
      this.broadcastElapsed = 0;
      this.onStateChange?.(getStage1975UiState(this.gameState));
    }
  }
}
