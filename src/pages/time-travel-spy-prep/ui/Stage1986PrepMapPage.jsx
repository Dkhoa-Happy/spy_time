import { Fragment, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  BookText,
  Flashlight,
  MapPinned,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

import {
  collectStage1986Item,
  completeStage1986Prep,
} from "../../../app/store/slices/appSlice";
import {
  STAGE_1986_PREP_LOCATIONS,
  STAGE_1986_PREP_TARGET_TOTAL,
  STAGE_1986_PREP_UV_RELEASE_COUNT,
} from "../../../features/time-travel-spy/lib/stage1986PrepConfig";
import { ROUTES } from "../../../shared/constants/routes";
import { Button } from "../../../shared/ui/button";

const uvRevealLabel =
  "Đã dò đủ mốc trung gian. Đèn UV vừa được nạp vào túi đồ.";
const successLabel = "Khớp đủ tọa độ lịch sử. Nhật ký đã được nạp vào túi đồ.";
const failLabel = "Sai tọa độ lịch sử. Hệ thống tự reset toàn bộ vòng dò tìm.";

const mapCenter = [16.3, 106.2];
const mapBounds = [
  [7.0, 101.8],
  [23.8, 111.2],
];

const getMarkerVisual = ({ location, isPicked, showContinue }) => {
  if (isPicked) {
    return {
      radius: 10,
      color: "#ffd2c3",
      fillColor: "#ff5722",
      fillOpacity: 0.9,
      weight: 2.2,
    };
  }

  if (showContinue && location.target) {
    return {
      radius: 10,
      color: "#ffc27f",
      fillColor: "#9f572b",
      fillOpacity: 0.68,
      weight: 2,
    };
  }

  // Keep all unresolved points visually similar so players must explore.
  return {
    radius: 8,
    color: "#9db7d6",
    fillColor: "#1f3f66",
    fillOpacity: 0.55,
    weight: 1.5,
  };
};

const pickedHaloVisual = {
  radius: 13,
  color: "#ff5722",
  fillColor: "#ff5722",
  fillOpacity: 0.14,
  weight: 1.6,
};

const pickedHoverTargetVisual = {
  radius: 20,
  color: "transparent",
  fillColor: "transparent",
  fillOpacity: 0,
  opacity: 0,
  weight: 0,
};

const getTooltipText = ({ location, isPicked, showContinue, index }) => {
  if (isPicked || showContinue) {
    return {
      title: location.name,
      body: location.event,
      meta: `${location.period} - ${location.sourceStage}`,
    };
  }

  return {
    title: `Điểm nghi vấn #${index + 1}`,
    body: "Chưa xác thực. Chọn để kiểm tra tính khớp với hồ sơ lịch sử.",
    meta: "TÌM KIẾM",
  };
};

const getTooltipDirection = (latitude) => (latitude >= 21 ? "bottom" : "top");

const createBurstPoints = (count = 14) => {
  const points = [];

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count;
    const radius = 56 + (index % 4) * 14;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  return points;
};

export const Stage1986PrepMapPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gameState = useSelector((state) => state.app.game);

  const stage1986PrepCompleted = Boolean(gameState?.stage1986PrepCompleted);
  const inventory = gameState?.inventory ?? {
    uvLight: false,
    fieldNotebook: false,
  };

  const shellRef = useRef(null);
  const mapRef = useRef(null);
  const uvRef = useRef(null);
  const diaryRef = useRef(null);
  const particlesRef = useRef([]);
  const isAnimatingRef = useRef(false);

  const [pickedIds, setPickedIds] = useState(() => new Set());
  const [statusMessage, setStatusMessage] = useState(
    "Chọn đúng 5 địa điểm khớp hồ sơ lịch sử từ các ải trước.",
  );
  const [statusKind, setStatusKind] = useState("idle");
  const [isRevealDone, setIsRevealDone] = useState(stage1986PrepCompleted);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const targetSequence = useMemo(
    () => STAGE_1986_PREP_LOCATIONS.filter((location) => location.target),
    [],
  );
  const pickedCount = pickedIds.size;
  const hasUvInBag = Boolean(inventory.uvLight);
  const hasNotebookInBag = Boolean(inventory.fieldNotebook);
  const showContinue =
    stage1986PrepCompleted || hasNotebookInBag || isRevealDone;
  const currentQuestion = showContinue
    ? null
    : (targetSequence[pickedIds.size] ?? null);

  const playFailureFeedback = () => {
    const shellNode = shellRef.current;
    const mapNode = mapRef.current;

    if (!shellNode || !mapNode) {
      return;
    }

    gsap.killTweensOf([shellNode, mapNode]);
    gsap.fromTo(
      shellNode,
      { x: -10 },
      {
        x: 10,
        duration: 0.07,
        ease: "power1.inOut",
        repeat: 6,
        yoyo: true,
        onComplete: () => {
          gsap.set(shellNode, { x: 0 });
        },
      },
    );

    gsap.fromTo(
      mapNode,
      { filter: "brightness(1) saturate(1)" },
      {
        filter: "brightness(1.18) saturate(1.2)",
        duration: 0.16,
        repeat: 1,
        yoyo: true,
      },
    );
  };

  const playCorrectMarkerEffect = (markerPoint) => {
    const mapNode = mapRef.current;

    if (!mapNode) {
      return;
    }

    const mapRect = mapNode.getBoundingClientRect();
    const startX = mapRect.left + Number(markerPoint?.x ?? mapRect.width * 0.5);
    const startY = mapRect.top + Number(markerPoint?.y ?? mapRect.height * 0.5);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const flyNode = document.createElement("div");
    flyNode.className = "stage1986-prep__magnifierFly";

    const burstNode = document.createElement("div");
    burstNode.className = "stage1986-prep__magnifierBurst";

    const burstPoints = createBurstPoints();
    const shardNodes = burstPoints.map(() => {
      const shard = document.createElement("span");
      burstNode.appendChild(shard);
      return shard;
    });

    document.body.appendChild(flyNode);
    document.body.appendChild(burstNode);

    gsap.set(flyNode, {
      x: startX,
      y: startY,
      scale: 0.36,
      opacity: 0,
      rotate: -24,
    });

    gsap.set(burstNode, {
      x: centerX,
      y: centerY,
      scale: 0.12,
      opacity: 0,
    });

    gsap.set(shardNodes, {
      x: 0,
      y: 0,
      scale: 0,
      opacity: 0,
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        flyNode.remove();
        burstNode.remove();
      },
    });

    timeline.to(flyNode, {
      opacity: 1,
      scale: 1,
      rotate: 10,
      duration: 0.16,
      ease: "back.out(1.8)",
    });

    timeline.to(
      flyNode,
      {
        x: centerX,
        y: centerY,
        duration: 0.52,
        ease: "power3.out",
      },
      ">-0.04",
    );

    timeline.to(
      flyNode,
      {
        rotate: 0,
        scale: 1.2,
        duration: 0.12,
        ease: "power2.out",
      },
      ">-0.03",
    );

    timeline.to(
      burstNode,
      {
        opacity: 1,
        scale: 1,
        duration: 0.08,
        ease: "power2.out",
      },
      "<",
    );

    timeline.to(
      shardNodes,
      {
        x: (index) => burstPoints[index]?.x ?? 0,
        y: (index) => burstPoints[index]?.y ?? 0,
        scale: (index) => (index % 3 === 0 ? 1.3 : 0.95),
        opacity: 1,
        duration: 0.1,
        ease: "power2.out",
        stagger: 0.01,
      },
      "<",
    );

    timeline.to(
      shardNodes,
      {
        x: (index) => (burstPoints[index]?.x ?? 0) * 1.5,
        y: (index) => (burstPoints[index]?.y ?? 0) * 1.5,
        scale: 0.12,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        stagger: 0.012,
      },
      ">-0.01",
    );

    timeline.to(
      flyNode,
      {
        scale: 0.14,
        opacity: 0,
        duration: 0.16,
        ease: "power2.in",
      },
      "<",
    );

    timeline.to(
      burstNode,
      {
        opacity: 0,
        duration: 0.08,
      },
      ">-0.1",
    );
  };

  const playItemReveal = ({
    itemKey,
    statusText,
    completeMission = false,
    lootCode,
  }) => {
    const itemNode = itemKey === "uvLight" ? uvRef.current : diaryRef.current;
    const shellNode = shellRef.current;
    const mapNode = mapRef.current;
    const particleNodes = particlesRef.current;

    if (!itemNode || !shellNode || !mapNode) {
      dispatch(collectStage1986Item(itemKey));
      if (completeMission) {
        setIsRevealDone(true);
        dispatch(completeStage1986Prep());
      }
      setStatusKind(completeMission ? "success" : "progress");
      setStatusMessage(statusText);
      return;
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);

    const mapBoundsRect = mapNode.getBoundingClientRect();
    const slotBounds = itemNode.getBoundingClientRect();
    const flyNode = document.createElement("div");
    flyNode.className = `stage1986-prep__lootFly stage1986-prep__lootFly--${
      itemKey === "uvLight" ? "uv" : "notebook"
    }`;
    flyNode.textContent = lootCode;
    document.body.appendChild(flyNode);

    gsap.set(itemNode, {
      opacity: 0.44,
      scale: 0.9,
      y: 6,
    });

    gsap.set(flyNode, {
      x: mapBoundsRect.left + mapBoundsRect.width * 0.52,
      y: mapBoundsRect.top + mapBoundsRect.height * 0.54,
      opacity: 0,
      scale: 0.2,
      rotate: -16,
    });

    gsap.set(particleNodes, {
      opacity: 0,
      scale: 0,
      x: 0,
      y: 0,
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        dispatch(collectStage1986Item(itemKey));

        if (completeMission) {
          setIsRevealDone(true);
          dispatch(completeStage1986Prep());
        }

        setStatusKind(completeMission ? "success" : "progress");
        setStatusMessage(statusText);
        isAnimatingRef.current = false;
        setIsAnimating(false);
        flyNode.remove();
      },
    });

    timeline.to(shellNode, {
      keyframes: [
        { x: -10, y: -1, duration: 0.06 },
        { x: 12, y: 2, duration: 0.06 },
        { x: -8, y: -1, duration: 0.06 },
        { x: 0, y: 0, duration: 0.07 },
      ],
      ease: "power1.inOut",
    });

    timeline.to(
      particleNodes,
      {
        opacity: 1,
        scale: 1,
        duration: 0.12,
        stagger: 0.02,
      },
      0,
    );

    timeline.to(
      particleNodes,
      {
        x: (_, target) => Number(target.dataset.dx ?? 0),
        y: (_, target) => Number(target.dataset.dy ?? 0),
        opacity: 0,
        scale: 0.2,
        duration: 0.65,
        ease: "power2.out",
        stagger: 0.02,
      },
      0.08,
    );

    timeline.to(
      flyNode,
      {
        opacity: 1,
        scale: 1,
        rotate: 8,
        duration: 0.3,
        ease: "back.out(1.8)",
      },
      0.1,
    );

    timeline.to(
      flyNode,
      {
        x: slotBounds.left + slotBounds.width / 2,
        y: slotBounds.top + slotBounds.height / 2,
        rotate: 0,
        duration: 0.62,
        ease: "power3.inOut",
      },
      0.34,
    );

    timeline.to(
      flyNode,
      {
        scale: 0.16,
        opacity: 0,
        duration: 0.2,
      },
      ">-0.06",
    );

    timeline.to(
      itemNode,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.28,
        ease: "back.out(1.6)",
      },
      "<",
    );
  };

  const handlePickLocation = (location, event) => {
    if (showContinue || pickedIds.has(location.id) || isAnimating) {
      return;
    }

    if (!currentQuestion || location.id !== currentQuestion.id) {
      setActiveMarkerId("");
      setPickedIds(new Set());
      setStatusKind("error");
      setStatusMessage(
        currentQuestion
          ? `${failLabel} Câu hiện tại yêu cầu địa điểm: ${currentQuestion.quizPrompt}`
          : failLabel,
      );
      playFailureFeedback();
      setIsErrorModalOpen(true);
      return;
    }

    setActiveMarkerId(location.id);
    const nextPicked = new Set(pickedIds);
    nextPicked.add(location.id);
    setPickedIds(nextPicked);
    window.setTimeout(() => {
      setActiveMarkerId("");
    }, 700);

    if (
      !hasUvInBag &&
      nextPicked.size >= STAGE_1986_PREP_UV_RELEASE_COUNT &&
      nextPicked.size < STAGE_1986_PREP_TARGET_TOTAL
    ) {
      playCorrectMarkerEffect(event?.containerPoint);
      playItemReveal({
        itemKey: "uvLight",
        statusText: uvRevealLabel,
        completeMission: false,
        lootCode: "UV",
      });
      return;
    }

    if (nextPicked.size === STAGE_1986_PREP_TARGET_TOTAL) {
      if (!hasNotebookInBag) {
        playItemReveal({
          itemKey: "fieldNotebook",
          statusText: successLabel,
          completeMission: true,
          lootCode: "NK",
        });
      }
      return;
    }

    setStatusKind("progress");
    setStatusMessage(
      nextPicked.size < STAGE_1986_PREP_TARGET_TOTAL
        ? `Đúng tọa độ. Chuyển sang câu tiếp theo (${nextPicked.size}/${STAGE_1986_PREP_TARGET_TOTAL}).`
        : "Đúng tọa độ cuối cùng. Đang hoàn tất cấp phát công cụ...",
    );
  };

  const handleResetRound = () => {
    if (showContinue || isAnimating) {
      return;
    }

    setPickedIds(new Set());
    setStatusKind("idle");
    setStatusMessage(
      "Vòng dò tìm đã làm mới. Trả lời lại từ Câu 1 rồi chọn điểm tương ứng trên bản đồ.",
    );
  };

  const goToStage1986 = () => {
    navigate(ROUTES.stage1986);
  };

  const goBackStage1975 = () => {
    navigate(ROUTES.stage1975);
  };

  return (
    <section className="stage1986-prep" ref={shellRef}>
      <header className="stage1986-prep__header">
        <div>
          <p className="stage1986-prep__eyebrow">Stage 4 / Prep Mission</p>
          <h2>Truy tìm công cụ 1986 trên bản đồ lịch sử</h2>
          <p>
            Tổng hợp mốc từ các ải trước, dò đúng 5 địa điểm then chốt để hệ
            thống nhả vật phẩm: đèn UV và cuốn nhật ký.
          </p>
        </div>
        <div className="stage1986-prep__actions">
          <Button type="button" variant="secondary" onClick={goBackStage1975}>
            Quay lại màn 1975
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleResetRound}
            disabled={showContinue || isAnimating}
          >
            <RotateCcw className="size-4" />
            Reset vòng
          </Button>
        </div>
      </header>

      <div className="stage1986-prep__content">
        <aside className="stage1986-prep__summary">
          <p className="stage1986-prep__panelTitle">Hồ sơ đã mã hóa</p>
          <div className="stage1986-prep__intelCard">
            <p className="stage1986-prep__intelLabel">Intel Brief</p>
            <h3>Dữ liệu địa điểm đã bị rút tên riêng</h3>
            <span>
              Hệ thống sẽ đưa từng câu hỏi địa danh. Trả lời câu hỏi bằng cách
              bấm đúng một marker tương ứng trên bản đồ.
            </span>
          </div>

          {!showContinue && currentQuestion && (
            <div className="stage1986-prep__intelCard">
              <p className="stage1986-prep__intelLabel">Câu hỏi hiện tại</p>
              <h3>
                {pickedCount + 1}/{STAGE_1986_PREP_TARGET_TOTAL}
              </h3>
              <span>{currentQuestion.quizPrompt}</span>
            </div>
          )}

          <div
            className={`stage1986-prep__status stage1986-prep__status--${statusKind}`}
          >
            <p>{statusMessage}</p>
            <strong>
              {pickedCount}/{STAGE_1986_PREP_TARGET_TOTAL}
            </strong>
          </div>

          <p className="stage1986-prep__panelTitle">Túi đồ điệp vụ</p>
          <div className="stage1986-prep__inventory">
            <div
              className={inventory.uvLight ? "is-collected" : ""}
              ref={uvRef}
            >
              <Flashlight className="size-4" />
              {inventory.uvLight ? "Đèn UV (Đã nhận)" : "Đèn UV"}
            </div>
            <div
              className={inventory.fieldNotebook ? "is-collected" : ""}
              ref={diaryRef}
            >
              <BookText className="size-4" />
              {inventory.fieldNotebook
                ? "Nhật ký điệp vụ (Đã nhận)"
                : "Nhật ký điệp vụ"}
            </div>
          </div>

          <Button
            type="button"
            onClick={goToStage1986}
            disabled={!showContinue}
          >
            Vào hồ sơ 1986
          </Button>
        </aside>

        <article className="stage1986-prep__map" ref={mapRef}>
          <MapContainer
            className="stage1986-prep__leaflet"
            center={mapCenter}
            zoom={6}
            minZoom={5}
            maxZoom={9}
            maxBounds={mapBounds}
            maxBoundsViscosity={0.8}
            zoomControl={false}
            scrollWheelZoom
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {STAGE_1986_PREP_LOCATIONS.map((location, index) => {
              const isPicked = pickedIds.has(location.id);
              const markerStyle = getMarkerVisual({
                location,
                isPicked,
                showContinue,
              });
              const tooltipText = getTooltipText({
                location,
                isPicked,
                showContinue,
                index,
              });

              return (
                <Fragment key={location.id}>
                  {isPicked && (
                    <CircleMarker
                      center={[
                        location.coordinates.lat,
                        location.coordinates.lng,
                      ]}
                      {...pickedHaloVisual}
                    />
                  )}
                  <CircleMarker
                    className={`stage1986-prep__marker ${
                      isPicked ? "is-picked" : ""
                    } ${activeMarkerId === location.id ? "is-active" : ""}`}
                    center={[
                      location.coordinates.lat,
                      location.coordinates.lng,
                    ]}
                    {...markerStyle}
                    eventHandlers={{
                      click: (event) => handlePickLocation(location, event),
                    }}
                  >
                    {!isPicked && (
                      <Tooltip
                        direction={getTooltipDirection(
                          location.coordinates.lat,
                        )}
                        offset={[0, 10]}
                        opacity={0.96}
                      >
                        <div className="stage1986-prep__tooltip">
                          <strong>{tooltipText.title}</strong>
                          <span>{tooltipText.body}</span>
                          <small>{tooltipText.meta}</small>
                        </div>
                      </Tooltip>
                    )}
                  </CircleMarker>

                  {isPicked && (
                    <CircleMarker
                      center={[
                        location.coordinates.lat,
                        location.coordinates.lng,
                      ]}
                      {...pickedHoverTargetVisual}
                    >
                      <Tooltip
                        direction={getTooltipDirection(
                          location.coordinates.lat,
                        )}
                        offset={[0, 12]}
                        opacity={0.96}
                        sticky
                      >
                        <div className="stage1986-prep__tooltip">
                          <strong>{tooltipText.title}</strong>
                          <span>{tooltipText.body}</span>
                          <small>{tooltipText.meta}</small>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  )}
                </Fragment>
              );
            })}
          </MapContainer>

          <div className="stage1986-prep__mapTexture" aria-hidden />
          <p className="stage1986-prep__mapTitle">
            <MapPinned className="size-4" />
            Bản đồ truy vết địa điểm
          </p>
          <p className="stage1986-prep__mapHint">
            Đọc câu hỏi bên trái rồi chọn đúng một marker trả lời cho câu đó.
          </p>

          <div className="stage1986-prep__particles" aria-hidden>
            {[...Array(20)].map((_, index) => {
              const angle = (Math.PI * 2 * index) / 20;
              const radius = 140 + (index % 4) * 24;
              const dx = Math.cos(angle) * radius;
              const dy = Math.sin(angle) * radius;
              return (
                <span
                  key={`particle-${index}`}
                  ref={(node) => {
                    particlesRef.current[index] = node;
                  }}
                  data-dx={dx.toFixed(2)}
                  data-dy={dy.toFixed(2)}
                />
              );
            })}
          </div>
        </article>
      </div>

      {isErrorModalOpen && (
        <div className="stage1986-prep__alertModal" role="dialog" aria-modal>
          <div className="stage1986-prep__alertCard">
            <p className="stage1986-prep__alertLabel">Cảnh báo nhiệm vụ</p>
            <h3>
              <TriangleAlert className="size-4" />
              Sai địa điểm
            </h3>
            <p>
              Bạn vừa chọn nhầm mốc lịch sử. Hệ thống đã reset toàn bộ vòng dò
              tìm, hãy đối chiếu hồ sơ và bắt đầu lại.
            </p>
            <div className="stage1986-prep__alertActions">
              <Button type="button" onClick={() => setIsErrorModalOpen(false)}>
                Tiếp tục dò tìm
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
