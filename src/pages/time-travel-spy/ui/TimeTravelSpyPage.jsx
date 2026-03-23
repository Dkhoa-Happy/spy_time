import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { completeStage } from "../../../app/store/slices/appSlice";
import { ROUTES } from "../../../shared/constants/routes";
import { Button } from "../../../shared/ui/button";
import {
  ROOM_ROUTES,
  ROOM_TITLES,
  isCorrectPassword,
} from "../../../features/time-travel-spy/lib/gameConfig";
import { Stage1945MemoryRoom } from "../../../features/time-travel-spy/ui/Stage1945MemoryRoom";
import { Stage1986Notebook } from "../../../features/time-travel-spy/ui/Stage1986Notebook";

const initialFlashlight = {
  x: 0,
  y: 0,
  active: false,
};

const getNextRoute = (stage) => {
  if (stage === 1) {
    return ROUTES.fragmentPuzzle;
  }

  if (stage === 2) {
    return ROOM_ROUTES[3];
  }

  return ROUTES.missionComplete;
};

const getLockedMessage = (stage) => {
  if (stage === 2) {
    return "Bạn cần giải phòng 1930 trước khi tiếp cận 1945.";
  }

  return "Bạn cần giải phòng 1945 trước khi vào manh mối 1986.";
};

const getIncorrectMessage = (stage) => {
  if (stage === 3) {
    return "Sai mật lệnh. Hãy ghép lại theo số đại hội, thời điểm diễn ra và chữ cái đầu của cụm khóa.";
  }

  return "Sai mật khẩu. Thử lại như một điệp viên thực thụ.";
};

export const TimeTravelSpyPage = ({ activeStage }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unlockedStage } = useSelector((state) => state.app.game);

  const [answers, setAnswers] = useState({
    1: "",
    2: "",
    3: "",
  });
  const [notification, setNotification] = useState({
    kind: "idle",
    message: "",
  });
  const [flashlight, setFlashlight] = useState(initialFlashlight);
  const [isUvEnabled, setIsUvEnabled] = useState(true);

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
        message: getLockedMessage(stage),
      });
      return;
    }

    const answer = answers[stage];
    if (!isCorrectPassword(stage, answer)) {
      setNotification({
        kind: "error",
        message: getIncorrectMessage(stage),
      });
      return;
    }

    dispatch(completeStage(stage));
    setNotification({
      kind: "success",
      message: "Xác nhận thành công. Đang mở khóa phòng tiếp theo...",
    });

    window.setTimeout(() => {
      navigate(getNextRoute(stage));
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

  const renderRoom1930 = activeStage === 1;
  const renderRoom1945 = activeStage === 2;
  const renderRoom1986 = activeStage === 3;

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border bg-surface p-5">
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

      <article className={renderRoom1930 ? "space-y-4" : "hidden"}>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Puzzle Area
          </p>
          <p className="mt-3 text-sm text-foreground/90">
            Hồ sơ mật năm 1930 đã bị mã hóa bằng một con số lịch sử trùng với
            năm sự kiện. Hãy nhập mật khẩu để mở cửa.
          </p>
        </div>

        <form
          className="grid gap-3 rounded-xl border border-border bg-surface p-6"
          onSubmit={(event) => handleSubmit(event, 1)}
        >
          <label
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="room-1-password"
          >
            Password
          </label>
          <input
            id="room-1-password"
            className="h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-brand"
            value={answers[1]}
            onChange={(event) => updateAnswer(1, event.target.value)}
            placeholder="Nhập mật khẩu phòng 1930"
            autoComplete="off"
          />
          <Button type="submit">Xác nhận phòng 1930</Button>
        </form>
      </article>

      <article className={renderRoom1945 ? "space-y-4" : "hidden"}>
        <Stage1945MemoryRoom />
      </article>

      <article className={renderRoom1986 ? "space-y-4" : "hidden"}>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Puzzle Area: Archived Field Dossier
          </p>

          <Stage1986Notebook
            answer={answers[3]}
            onAnswerChange={(value) => updateAnswer(3, value)}
            onSubmit={(event) => handleSubmit(event, 3)}
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
        </div>
      </article>
    </section>
  );
};
