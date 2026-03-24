import { useEffect, useMemo, useRef, useState } from "react";
import Phaser from "phaser";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Coins,
  Heart,
  RefreshCcw,
  Shield,
  TriangleAlert,
  Wheat,
} from "lucide-react";

import { Button } from "../../../shared/ui/button";
import {
  STAGE_1975_ACTION_COSTS,
  createStage1975InitialState,
} from "../lib/stage1975GameConfig";
import {
  STAGE_STORY_BRIEFINGS,
  formatStageStoryBriefing,
  getStage1975WaveBriefing,
} from "../lib/stageStoryBriefings";
import {
  canAffordStage1975Cost,
  formatStage1975Cost,
  getStage1975UiState,
} from "../lib/stage1975Runtime";
import { AdventureStoryOverlay } from "./AdventureStoryOverlay";
import { Stage1975PhaserScene } from "./Stage1975PhaserScene";

const initialUiState = getStage1975UiState(createStage1975InitialState());
const stage1975IntroBriefing = STAGE_STORY_BRIEFINGS.screen1;
const stage1975FinalBriefing = STAGE_STORY_BRIEFINGS.final;

export const Stage1975FarmDefenseRoom = ({
  stageTitle = "Stage 3: Nông trại phòng tuyến 1975",
  stageDescription = "",
  onBack,
  onComplete,
}) => {
  const mountRef = useRef(null);
  const phaserGameRef = useRef(null);
  const sceneControllerRef = useRef(null);
  const [uiState, setUiState] = useState(initialUiState);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [acknowledgedWaveBriefing, setAcknowledgedWaveBriefing] = useState(1);

  useEffect(() => {
    if (!mountRef.current || showIntro) {
      return undefined;
    }

    const scene = new Stage1975PhaserScene({
      onStateChange: (nextState) => {
        setUiState(nextState);
      },
      onSceneReady: (controller) => {
        sceneControllerRef.current = controller;
        setIsSceneReady(true);
      },
    });

    const phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      width: 1000,
      height: 620,
      backgroundColor: "#101716",
      render: {
        antialias: false,
        pixelArt: true,
        powerPreference: "high-performance",
        roundPixels: true,
      },
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1000,
        height: 620,
      },
      scene: [scene],
    });

    phaserGameRef.current = phaserGame;

    return () => {
      sceneControllerRef.current = null;
      setIsSceneReady(false);
      setUiState(initialUiState);
      phaserGame.destroy(true);
      phaserGameRef.current = null;
    };
  }, [showIntro]);

  const safeResources = useMemo(
    () => ({
      money: uiState.money,
      food: uiState.food,
    }),
    [uiState.food, uiState.money],
  );

  const activeWaveBriefing = useMemo(() => {
    if (
      showIntro ||
      !isSceneReady ||
      uiState.phase !== "playing" ||
      uiState.wave <= 1 ||
      uiState.wave <= acknowledgedWaveBriefing
    ) {
      return null;
    }

    const nextBriefing = getStage1975WaveBriefing(uiState.wave);
    if (!nextBriefing) {
      return null;
    }

    return {
      wave: uiState.wave,
      ...nextBriefing,
    };
  }, [
    acknowledgedWaveBriefing,
    isSceneReady,
    showIntro,
    uiState.phase,
    uiState.wave,
  ]);

  useEffect(() => {
    if (!activeWaveBriefing) {
      sceneControllerRef.current?.resumeGameplay?.();
      return;
    }

    sceneControllerRef.current?.pauseGameplay?.();
  }, [activeWaveBriefing]);

  const handleSceneAction = (actionKey) => {
    if (actionKey === "restart") {
      setAcknowledgedWaveBriefing(1);
    }

    if (!isSceneReady || !sceneControllerRef.current) {
      return;
    }

    sceneControllerRef.current[actionKey]?.();
  };

  const handleDismissWaveBriefing = () => {
    if (!activeWaveBriefing) {
      return;
    }

    setAcknowledgedWaveBriefing(activeWaveBriefing.wave);
  };

  const unlockPlotCost = STAGE_1975_ACTION_COSTS.unlockPlot[uiState.openedPlots - 1];
  const upgradeFarmCost =
    STAGE_1975_ACTION_COSTS.upgradeFarm[uiState.farmLevel - 1];
  const hireFarmerCost = uiState.farmerHired
    ? null
    : STAGE_1975_ACTION_COSTS.hireFarmer;
  const hireSoldierCost =
    STAGE_1975_ACTION_COSTS.hireSoldier[uiState.soldiersHired] ?? null;
  const upgradeFenceCost =
    STAGE_1975_ACTION_COSTS.upgradeFence[uiState.fenceLevel - 1];
  const forgeHoeCost =
    STAGE_1975_ACTION_COSTS.forgeHoe[uiState.weaponLevel - 1];

  const actionCards = [
    {
      id: "unlockPlot",
      label: "Mở ruộng",
      cost: unlockPlotCost,
      disabled: uiState.phase !== "playing" || !unlockPlotCost || !isSceneReady,
    },
    {
      id: "upgradeFarm",
      label: "Nâng nông trại",
      cost: upgradeFarmCost,
      disabled:
        uiState.phase !== "playing" || !upgradeFarmCost || !isSceneReady,
    },
    {
      id: "hireFarmer",
      label: "Gọi nông dân",
      cost: hireFarmerCost,
      disabled: uiState.phase !== "playing" || uiState.farmerHired || !isSceneReady,
    },
    {
      id: "hireSoldier",
      label: "Gọi bộ đội",
      cost: hireSoldierCost,
      disabled:
        uiState.phase !== "playing" || !hireSoldierCost || !isSceneReady,
    },
    {
      id: "upgradeFence",
      label: "Nâng rào",
      cost: upgradeFenceCost,
      disabled:
        uiState.phase !== "playing" || !upgradeFenceCost || !isSceneReady,
    },
    {
      id: "forgeHoe",
      label: "Rèn cuốc",
      cost: forgeHoeCost,
      disabled: uiState.phase !== "playing" || !forgeHoeCost || !isSceneReady,
    },
  ];

  const hudCards = [
    {
      id: "money",
      icon: Coins,
      label: "Tiền",
      value: `${uiState.money}`,
      accentClass:
        "border-amber-300/28 bg-[linear-gradient(180deg,rgba(48,33,11,0.86),rgba(24,17,8,0.88))] text-amber-100",
      valueClass: "text-amber-100",
      subtext: "Nhặt từ địch",
    },
    {
      id: "food",
      icon: Wheat,
      label: "Lương thực",
      value: `${uiState.food}`,
      accentClass:
        "border-emerald-300/28 bg-[linear-gradient(180deg,rgba(18,46,25,0.86),rgba(10,24,15,0.9))] text-emerald-100",
      valueClass: "text-emerald-100",
      subtext: "Duy trì bộ đội",
    },
    {
      id: "fence",
      icon: Shield,
      label: "Hàng rào",
      value: `${Math.max(0, Math.round(uiState.fenceHp))}/${uiState.fenceMaxHp}`,
      accentClass:
        "border-cyan-300/28 bg-[linear-gradient(180deg,rgba(13,33,42,0.86),rgba(10,17,24,0.9))] text-cyan-100",
      valueClass: "text-cyan-100",
      subtext: `Cấp ${uiState.fenceLevel}`,
    },
    {
      id: "hp",
      icon: Heart,
      label: "HP",
      value: `${Math.round(uiState.playerHp)}`,
      accentClass:
        "border-rose-300/28 bg-[linear-gradient(180deg,rgba(46,17,22,0.86),rgba(24,10,14,0.9))] text-rose-100",
      valueClass: "text-rose-100",
      subtext: `Cuốc cấp ${uiState.weaponLevel}`,
    },
  ];

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-[1.5rem] border border-border/75 bg-[linear-gradient(160deg,rgba(15,24,17,0.98),rgba(16,18,25,0.98))] p-5 shadow-[0_24px_58px_rgb(0_0_0_/_0.3)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              {onBack && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onBack}
                >
                  Quay lại màn trước
                </Button>
              )}

              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
                Time-traveling Spy
              </p>

              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-200/6 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                <Shield className="size-4" />
                Room 3 / 1975
              </p>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {stageTitle}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Nông trại phòng tuyến
            </h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {stageDescription ||
                formatStageStoryBriefing(stage1975IntroBriefing)}
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.8rem] border border-[#8aa57a]/45 bg-[radial-gradient(circle_at_top_left,rgba(158,204,120,0.2),rgba(10,16,11,0.15)_26%),linear-gradient(180deg,rgba(26,45,22,0.96),rgba(16,26,17,0.98))] p-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.05)]">
          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,12,9,0.74),rgba(8,13,10,0.88))] p-3 shadow-[0_18px_40px_rgb(0_0_0_/_0.22)] backdrop-blur-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {hudCards
                    .filter((card) => card.id === "money" || card.id === "food")
                    .map((card) => {
                      const Icon = card.icon;

                      return (
                        <div
                          key={card.id}
                          className={`min-w-[10rem] rounded-2xl border px-3 py-2 shadow-[0_12px_28px_rgb(0_0_0_/_0.2)] ${card.accentClass}`}
                        >
                          <p className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/72">
                            <Icon className="size-3.5" />
                            {card.label}
                          </p>
                          <p className={`mt-1 text-2xl font-bold leading-none ${card.valueClass}`}>
                            {card.value}
                          </p>
                        </div>
                      );
                    })}
                </div>

                <div className="min-w-[19rem] flex-1 rounded-[1.2rem] border border-white/12 bg-white/5 p-3 shadow-[0_14px_26px_rgb(0_0_0_/_0.18)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/55">
                        Bảng hành động
                      </p>
                      <p className="mt-1 text-[0.72rem] leading-5 text-white/68">
                        `W A S D` / `↑ ↓ ← →` để di chuyển. Chọn lệnh ngay tại đây.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSceneAction("restart")}
                      disabled={!isSceneReady}
                      className="border-white/16 bg-white/8 text-white hover:bg-white/12"
                    >
                      <RefreshCcw className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {actionCards.map((action) => {
                      const affordable = canAffordStage1975Cost(
                        safeResources,
                        action.cost,
                      );

                      return (
                        <button
                          key={action.id}
                          type="button"
                          className={`rounded-xl border px-3 py-3 text-left transition ${
                            action.disabled
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                              : affordable
                                ? "border-emerald-300/28 bg-emerald-300/10 text-white hover:border-emerald-300/46 hover:bg-emerald-300/14"
                                : "border-amber-300/28 bg-amber-300/10 text-white hover:border-amber-300/46 hover:bg-amber-300/14"
                          }`}
                          onClick={() => handleSceneAction(action.id)}
                          disabled={action.disabled}
                        >
                          <p className="text-[0.74rem] font-semibold uppercase tracking-[0.14em]">
                            {action.label}
                          </p>
                          <p className="mt-1 text-[0.66rem] text-white/65">
                            {formatStage1975Cost(action.cost)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hudCards
                    .filter((card) => card.id === "fence" || card.id === "hp")
                    .map((card) => {
                      const Icon = card.icon;

                      return (
                        <div
                          key={card.id}
                          className={`min-w-[10rem] rounded-2xl border px-3 py-2 shadow-[0_12px_28px_rgb(0_0_0_/_0.2)] ${card.accentClass}`}
                        >
                          <p className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/72">
                            <Icon className="size-3.5" />
                            {card.label}
                          </p>
                          <p className={`mt-1 text-2xl font-bold leading-none ${card.valueClass}`}>
                            {card.value}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {uiState.isAutomationPaused && (
                <div className="mt-3 inline-flex max-w-xl items-start gap-2 rounded-2xl border border-amber-300/35 bg-[rgba(61,42,9,0.82)] px-3 py-2 text-sm text-amber-100 shadow-[0_14px_28px_rgb(0_0_0_/_0.24)]">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Kho lương đã cạn, nông dân và bộ đội đang tạm dừng. Thu hoạch
                    thủ công để nối lại phòng thủ.
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
              <div className="overflow-hidden rounded-[1.5rem] border border-[#98b07e]/35 bg-black/25 shadow-[0_20px_38px_rgb(0_0_0_/_0.24)]">
                <div
                  ref={mountRef}
                  className="aspect-[1000/620] w-full [&_canvas]:!h-auto [&_canvas]:!w-full [&_canvas]:block"
                />
              </div>

              <aside className="rounded-[1.4rem] border border-white/12 bg-[linear-gradient(180deg,rgba(8,14,10,0.84),rgba(6,10,8,0.92))] p-3 shadow-[0_18px_40px_rgb(0_0_0_/_0.28)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/55">
                      Hướng dẫn
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/72">
                      Theo dõi nhiệm vụ hiện tại và điều khiển nhân vật bằng bàn phím.
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-white/12 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/55">
                        Điều hướng bàn phím
                      </p>
                      <p className="mt-1 text-[0.7rem] leading-5 text-white/68">
                        Dùng `W A S D` hoặc các phím mũi tên để chạy trong sân.
                      </p>
                    </div>
                    <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                      Keyboard
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/76">
                    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                      W A S D
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                      ↑ ↓ ← →
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-emerald-300/18 bg-[rgba(10,20,12,0.82)] p-3 shadow-[0_14px_30px_rgb(0_0_0_/_0.22)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/55">
                        Nhiệm vụ hiện tại
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {uiState.missionTitle}
                      </p>
                    </div>
                    <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                      {uiState.isTutorialWave ? "Màn 1" : `Wave ${uiState.wave}`}
                    </div>
                  </div>

                  <p className="mt-2 text-[0.72rem] leading-6 text-white/68">
                    {uiState.missionDescription}
                  </p>

                  <div className="mt-3 inline-flex rounded-full border border-white/12 bg-black/15 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                    {uiState.missionProgressLabel}
                  </div>

                  <div className="mt-3 grid gap-2">
                    {uiState.missionChecklist.map((step) => {
                      const StepIcon = step.completed ? CheckCircle2 : Circle;

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] ${
                            step.completed
                              ? "border-emerald-300/22 bg-emerald-300/10 text-emerald-100"
                              : "border-white/10 bg-black/15 text-white/72"
                          }`}
                        >
                          <StepIcon className="size-4 shrink-0" />
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </aside>
            </div>
          </div>
        </div>
      </article>

      {uiState.phase === "defeat" && (
        <AdventureStoryOverlay
          theme="alert"
          badge="Phòng tuyến sụp đổ"
          eyebrow={`Wave ${uiState.wave} đã vượt qua phòng thủ`}
          title="Bạn đã ngã xuống giữa hậu phương 1975"
          description="Tiến độ room chưa được ghi. Hãy dựng lại hàng rào, khôi phục nhịp lúa và trụ vững đủ 10 wave trước khi xác nhận mở hồ sơ 1986."
          progressLabel={`Room 3 thất thủ tại wave ${uiState.wave}`}
          progressValue={Math.min(uiState.wave / 10, 1)}
          metrics={[
            { label: "Wave đạt tới", value: `${uiState.wave} / 10` },
            { label: "Kẻ địch hạ", value: `${uiState.totalKills}` },
            { label: "Lương thực", value: `${uiState.food}` },
          ]}
          actionLabel="Dựng lại phòng tuyến"
          onAction={() => handleSceneAction("restart")}
          actionIcon={RefreshCcw}
        />
      )}

      {uiState.phase === "victory" && (
        <AdventureStoryOverlay
          theme="frontier"
          badge="Hoàn tất ải 3"
          eyebrow="Phòng tuyến 1975 đã trụ vững"
          title={stage1975FinalBriefing.title}
          description={formatStageStoryBriefing(stage1975FinalBriefing)}
          progressLabel="3 / 4 room hoàn tất • Stage 4 đã mở"
          progressValue={0.75}
          metrics={[
            { label: "Wave", value: "10 / 10" },
            { label: "Kẻ địch hạ", value: `${uiState.totalKills}` },
            { label: "Lương thực còn", value: `${uiState.food}` },
          ]}
          actionLabel="Xác nhận sang màn chuẩn bị 1986"
          onAction={onComplete}
          actionIcon={ArrowRight}
        />
      )}

      {showIntro && (
        <AdventureStoryOverlay
          theme="frontier"
          title={stage1975IntroBriefing.title}
          description={formatStageStoryBriefing(stage1975IntroBriefing)}
          actionLabel={stage1975IntroBriefing.actionLabel}
          onAction={() => {
            setAcknowledgedWaveBriefing(1);
            setShowIntro(false);
          }}
          actionIcon={ArrowRight}
        />
      )}

      {activeWaveBriefing && uiState.phase === "playing" && (
        <AdventureStoryOverlay
          theme="frontier"
          title={activeWaveBriefing.title}
          description={formatStageStoryBriefing(activeWaveBriefing)}
          actionLabel={activeWaveBriefing.actionLabel}
          onAction={handleDismissWaveBriefing}
          actionIcon={ArrowRight}
        />
      )}
    </section>
  );
};
