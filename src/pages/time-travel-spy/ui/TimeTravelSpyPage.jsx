import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { completeStage } from "../../../app/store/slices/appSlice";
import { ROUTES } from "../../../shared/constants/routes";
import { Button } from "../../../shared/ui/button";
import {
  ROOM_TITLES,
  getStageIncorrectMessage,
  getStageLockedMessage,
  isCorrectPassword,
  isStage1986ToolsetReady,
} from "../../../features/time-travel-spy/lib/gameConfig";
import { Stage1945MemoryRoom } from "../../../features/time-travel-spy/ui/Stage1945MemoryRoom";
import { Stage1975FarmDefenseRoom } from "../../../features/time-travel-spy/ui/Stage1975FarmDefenseRoom";
import { Stage1986Notebook } from "../../../features/time-travel-spy/ui/Stage1986Notebook";

const initialFlashlight = {
  x: 0,
  y: 0,
  active: false,
};

const STAGE_PAGE_CONFIG = {
  1: {
    nextRoute: ROUTES.stage1945,
    previousRoute: ROUTES.home,
  },
  2: {
    previousRoute: ROUTES.stage1930,
  },
  3: {
    previousRoute: ROUTES.stage1945,
  },
  4: {
    nextRoute: ROUTES.missionComplete,
    previousRoute: ROUTES.stage1986Prep,
  },
};

export const TimeTravelSpyPage = ({ activeStage }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gameState = useSelector((state) => state.app.game);
  const unlockedStage = gameState?.unlockedStage ?? 1;
  const activeStageConfig = STAGE_PAGE_CONFIG[activeStage] ?? STAGE_PAGE_CONFIG[4];

  const [answers, setAnswers] = useState({
    1: "",
    4: "",
  });
  const [notification, setNotification] = useState({
    kind: "idle",
    message: "",
  });
  const [flashlight, setFlashlight] = useState(initialFlashlight);
  const [isUvEnabled, setIsUvEnabled] = useState(false);

  const hiddenMask = useMemo(() => {
    if (!flashlight.active || !isUvEnabled) {
      return "radial-gradient(circle 0px at 0px 0px, transparent 0%, transparent 100%)";
    }

    return `radial-gradient(circle 136px at ${flashlight.x}px ${flashlight.y}px, black 0%, black 58%, transparent 100%)`;
  }, [flashlight, isUvEnabled]);

  const updateAnswer = (stage, value) => {
    setAnswers((prev) => ({
      ...prev,
      [stage]: value,
    }));

    if (notification.kind !== "idle") {
      setNotification({ kind: "idle", message: "" });
    }
  };

  const handleSubmit = (event, stage) => {
    event.preventDefault();

    if (stage > unlockedStage) {
      setNotification({
        kind: "error",
        message: getStageLockedMessage(stage),
      });
      return;
    }

    const answer = answers[stage];
    if (!isCorrectPassword(stage, answer)) {
      setNotification({
        kind: "error",
        message: getStageIncorrectMessage(stage),
      });
      return;
    }

    dispatch(completeStage(stage));
    setNotification({
      kind: "success",
      message: "Xác nhận thành công. Đang mở khóa phòng tiếp theo...",
    });

    window.setTimeout(() => {
      navigate(STAGE_PAGE_CONFIG[stage]?.nextRoute ?? ROUTES.missionComplete);
    }, 550);
  };

  const isNotificationVisible = notification.kind !== "idle";

  const updateFlashlightFromPoint = (clientX, clientY, element) => {
    const bounds = element.getBoundingClientRect();

    setFlashlight({
      x: clientX - bounds.left,
      y: clientY - bounds.top,
      active: true,
    });
  };

  const renderRoom1945 = activeStage === 2;
  const renderRoom1975 = activeStage === 3;
  const renderRoom1986 = activeStage === 4;
  const canAccessStage1986Tools = isStage1986ToolsetReady(gameState);
  const showPageHeader = !(renderRoom1945 || renderRoom1975);

  const handleBackToPreviousStage = () => {
    navigate(activeStageConfig.previousRoute ?? ROUTES.home);
  };

  return (
    <section className="space-y-5">
      {showPageHeader && (
        <header className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-4 flex justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBackToPreviousStage}
            >
              Quay lại màn trước
            </Button>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Time-traveling Spy
          </p>
          <h2 className="mt-2 tracking-tighter text-3xl font-bold text-foreground">
            {ROOM_TITLES[activeStage]}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Giải mật mã đúng thứ tự để giữ nguyên dòng thời gian lịch sử.
          </p>
        </header>
      )}

      {isNotificationVisible && (
        <p
          className={`rounded-md border px-4 py-3 text-sm ${
            notification.kind === "success"
              ? "border-emerald-400/60 bg-emerald-950/40 text-emerald-200"
              : "border-red-400/60 bg-red-950/40 text-red-200"
          }`}
        >
          {notification.message}
        </p>
      )}

      <article className={renderRoom1945 ? "space-y-4" : "hidden"}>
        <Stage1945MemoryRoom
          stageTitle={ROOM_TITLES[activeStage]}
          stageDescription="Giải mật mã đúng thứ tự để giữ nguyên dòng thời gian lịch sử."
          onBack={handleBackToPreviousStage}
        />
      </article>

      <article className={renderRoom1975 ? "space-y-4" : "hidden"}>
        <Stage1975FarmDefenseRoom
          stageTitle={ROOM_TITLES[activeStage]}
          stageDescription="Xây hậu phương, giữ hàng rào và sống sót qua 10 wave để mở đường tới hồ sơ 1986."
          onBack={handleBackToPreviousStage}
          onComplete={() => {
            dispatch(completeStage(3));
            navigate(ROUTES.stage1986Prep);
          }}
        />
      </article>

      <article className={renderRoom1986 ? "space-y-4" : "hidden"}>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Puzzle Area: Archived Field Dossier
          </p>

          {!canAccessStage1986Tools && (
            <div className="mt-4 grid gap-3 rounded-xl border border-brand/35 bg-brand/10 p-4 text-sm text-orange-100">
              <p className="font-semibold tracking-tight">
                Màn 4 đang khóa công cụ hỗ trợ.
              </p>
              <p>
                Bạn cần hoàn tất màn bản đồ chuẩn bị để tìm đèn UV và cuốn nhật
                ký trước khi mở hồ sơ 1986.
              </p>
              <div>
                <Button
                  type="button"
                  onClick={() => navigate(ROUTES.stage1986Prep)}
                >
                  Đi đến màn bản đồ chuẩn bị
                </Button>
              </div>
            </div>
          )}

          {canAccessStage1986Tools && (
            <Stage1986Notebook
              answer={answers[4]}
              onAnswerChange={(value) => updateAnswer(4, value)}
              onSubmit={(event) => handleSubmit(event, 4)}
              isUvEnabled={isUvEnabled}
              onToggleUv={() => setIsUvEnabled((prev) => !prev)}
              flashlight={flashlight}
              hiddenMask={hiddenMask}
              onMouseEnter={() =>
                setFlashlight((prev) => ({ ...prev, active: true }))
              }
              onMouseLeave={() => setFlashlight(initialFlashlight)}
              onMouseMove={(event) =>
                updateFlashlightFromPoint(
                  event.clientX,
                  event.clientY,
                  event.currentTarget,
                )
              }
              onTouchStart={(event) => {
                const touch = event.touches[0];
                if (!touch) {
                  return;
                }

                updateFlashlightFromPoint(
                  touch.clientX,
                  touch.clientY,
                  event.currentTarget,
                );
              }}
              onTouchMove={(event) => {
                const touch = event.touches[0];
                if (!touch) {
                  return;
                }

                updateFlashlightFromPoint(
                  touch.clientX,
                  touch.clientY,
                  event.currentTarget,
                );
              }}
              onTouchEnd={() => setFlashlight(initialFlashlight)}
            />
          )}
        </div>
      </article>
    </section>
  );
};
