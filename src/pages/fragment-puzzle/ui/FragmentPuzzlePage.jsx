import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/FragmentPuzzle.css";
import { completeStage } from "../../../app/store/slices/appSlice";
import { ROUTES } from "@/shared/constants/routes";

const getFragmentRotation = (fragmentId) =>
  fragmentId === 1 ? -15 : fragmentId === 2 ? 5 : fragmentId === 3 ? 12 : fragmentId === 4 ? -8 : 10;

const getResponsiveLayout = (viewportWidth) => {
  if (viewportWidth <= 480) {
    return {
      sheetWidth: 470,
      sheetTop: 78,
      pieceWidth: 130,
      pieceHeight: 108,
      columnGap: 28,
      rowGap: 34,
      topOffset: 76,
    };
  }

  if (viewportWidth <= 768) {
    return {
      sheetWidth: 540,
      sheetTop: 92,
      pieceWidth: 200,
      pieceHeight: 144,
      columnGap: 32,
      rowGap: 32,
      topOffset: 84,
    };
  }

  return {
    sheetWidth: 590,
    sheetTop: 110,
    pieceWidth: 220,
    pieceHeight: 156,
    columnGap: 34,
    rowGap: 34,
    topOffset: 86,
  };
};

const getTargetPosition = (fragmentId, canvasWidth, viewportWidth) => {
  const layout = getResponsiveLayout(viewportWidth);
  const sheetLeft = (canvasWidth - layout.sheetWidth) / 2;
  const leftColumnX =
    (layout.sheetWidth - layout.pieceWidth * 2 - layout.columnGap) / 2;
  const rightColumnX = leftColumnX + layout.pieceWidth + layout.columnGap;
  const centerColumnX = (layout.sheetWidth - layout.pieceWidth) / 2;
  const secondRowY = layout.topOffset + layout.pieceHeight + layout.rowGap;
  const thirdRowY = secondRowY + layout.pieceHeight + layout.rowGap;

  const offsets =
    fragmentId === 1
      ? { x: leftColumnX, y: layout.topOffset }
      : fragmentId === 2
        ? { x: rightColumnX, y: layout.topOffset }
        : fragmentId === 3
          ? { x: leftColumnX, y: secondRowY }
          : fragmentId === 4
            ? { x: rightColumnX, y: secondRowY }
            : { x: centerColumnX, y: thirdRowY };

  return {
    x: Math.round(sheetLeft + offsets.x),
    y: Math.round(layout.sheetTop + offsets.y),
  };
};

const FragmentPuzzlePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fragments, setFragments] = useState([
    {
      id: 1,
      text: "Chủ trương làm tư sản\ndân quyền cách mạng,",
      initialPos: { x: 60, y: 70 },
      currentPos: { x: 60, y: 70 },
      rotation: -15,
      aligned: false,
    },
    {
      id: 2,
      text: "và thổ địa cách mạng,\nđể xây dựng",
      initialPos: { x: 620, y: 90 },
      currentPos: { x: 620, y: 90 },
      rotation: 5,
      aligned: false,
    },
    {
      id: 3,
      text: "đảng thống nhất,\nhướng tới",
      initialPos: { x: 90, y: 470 },
      currentPos: { x: 90, y: 470 },
      rotation: 12,
      aligned: false,
    },
    {
      id: 4,
      text: "xã hội cộng sản toàn cầu,\nđộc lập",
      initialPos: { x: 620, y: 470 },
      currentPos: { x: 620, y: 470 },
      rotation: -8,
      aligned: false,
    },
    {
      id: 5,
      text: "tự do thịnh vượng.",
      initialPos: { x: 340, y: 40 },
      currentPos: { x: 340, y: 40 },
      rotation: 10,
      aligned: false,
    },
  ]);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [kickedBack, setKickedBack] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const gameRef = useRef(null);
  const completionTriggeredRef = useRef(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const [canvasWidth, setCanvasWidth] = useState(980);
  const SNAP_DISTANCE = 95;

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!gameRef.current) {
      return;
    }

    const updateCanvasWidth = () => {
      setCanvasWidth(gameRef.current?.clientWidth ?? 980);
    };

    updateCanvasWidth();

    const observer = new ResizeObserver(() => {
      updateCanvasWidth();
    });

    observer.observe(gameRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = (e, fragmentId) => {
    const fragment = fragments.find((f) => f.id === fragmentId);
    if (fragment?.aligned) return;
    const gameRect = gameRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - gameRect.left - fragment.currentPos.x,
      y: e.clientY - gameRect.top - fragment.currentPos.y,
    });
    setDraggedId(fragmentId);
  };

  const handleMouseMove = (e) => {
    if (draggedId === null) return;

    const gameRect = gameRef.current.getBoundingClientRect();
    const newX = e.clientX - gameRect.left - dragOffset.x;
    const newY = e.clientY - gameRect.top - dragOffset.y;

    setFragments((prev) =>
      prev.map((frag) =>
        frag.id === draggedId
          ? {
              ...frag,
              currentPos: { x: Math.max(0, newX), y: Math.max(0, newY) },
            }
          : frag,
      ),
    );
  };

  const handleMouseUp = () => {
    if (draggedId === null) return;

    const draggedFragment = fragments.find((f) => f.id === draggedId);
    if (!draggedFragment) {
      setDraggedId(null);
      return;
    }

    // Find nearest target slot to current position
    const canvasWidth = gameRef.current?.clientWidth ?? 980;
    let nearestSlot = null;
    let minDistance = SNAP_DISTANCE;

    fragments.forEach((frag) => {
      const targetPos = getTargetPosition(frag.id, canvasWidth, viewportWidth);
      const distance = Math.sqrt(
        Math.pow(draggedFragment.currentPos.x - targetPos.x, 2) +
          Math.pow(draggedFragment.currentPos.y - targetPos.y, 2),
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestSlot = { ...frag, targetPos };
      }
    });

    if (nearestSlot && nearestSlot.id === draggedId) {
      setFragments((prev) =>
        prev.map((frag) =>
          frag.id === draggedId
            ? {
                ...frag,
                currentPos: { ...nearestSlot.targetPos },
                aligned: true,
                rotation: 0,
              }
            : frag,
        ),
      );
    } else {
      // Kick back to initial position with bounce animation
      setKickedBack(draggedId);
      setTimeout(() => {
        setFragments((prev) =>
          prev.map((frag) =>
            frag.id === draggedId
              ? { ...frag, currentPos: { ...frag.initialPos } }
              : frag,
          ),
        );
        setKickedBack(null);
      }, 400);
    }

    setDraggedId(null);
  };

  useEffect(() => {
    const allAligned = fragments.every((f) => f.aligned);
    if (allAligned && !completionTriggeredRef.current) {
      completionTriggeredRef.current = true;
      const revealTimer = setTimeout(() => {
        setShowPassword(true);
      }, 1000);
      return () => clearTimeout(revealTimer);
    }

    if (!allAligned) {
      completionTriggeredRef.current = false;
    }
  }, [fragments]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const upperInput = password.toUpperCase().trim();

    // Only CỬU LONG (HONG KONG) - but not revealed on screen
    if (
      upperInput === "CỬU LONG" ||
      upperInput === "CUU LONG" ||
      upperInput === "CUULONG" ||
      upperInput === "HONG KONG" ||
      upperInput === "HONGKONG"
    ) {
      dispatch(completeStage(1));
      setNotification({
        type: "success",
        title: "✓ CHÍNH XÁC!",
        message:
          "Hội nghị hợp nhất đã diễn ra thành công. Đảng cộng sản Việt Nam được thành lập!",
      });
      // Navigate to stage 1945 after a short delay
      setTimeout(() => {
        navigate(ROUTES.stage1945);
      }, 1500);
    } else {
      setNotification({
        type: "error",
        title: "✗ SAI RỒI!",
        message:
          "Hãy ghép đúng tất cả 5 mảnh và suy nghĩ kỹ về lịch sử cách mạng Việt Nam.",
      });
    }
  };

  const closeNotification = () => {
    if (notification?.type === "success") {
      setTimeout(() => {
        navigate(ROUTES.stage1945);
      }, 300);
    }
    setNotification(null);
  };

  const resetGame = () => {
    setFragments((prev) =>
      prev.map((frag) => ({
        ...frag,
        currentPos: { ...frag.initialPos },
        aligned: false,
        rotation: getFragmentRotation(frag.id),
      })),
    );
    setShowPassword(false);
    setPassword("");
    completionTriggeredRef.current = false;
  };

  return (
    <div className="fragment-puzzle-container">
      <div className="bunker-backdrop"></div>

      <div className="game-panel">
        <div className="mission-brief">
          <div className="dossier-card-accent" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p className="mission-brief__eyebrow">Hồ sơ mật TS-1930</p>
          <h1>Mật lệnh Cửu Long (1930)</h1>
          <p className="mission-text">
            Đồng chí giao liên! Phong trào đang bị chia rẽ bởi 3 tổ chức cộng
            sản riêng biệt. Lãnh tụ Nguyễn Ái Quôc đã gửi chỉ thị triệu tập để
            hợp nhất lực lượng cách mạng. Mật thám Pháp đang bủa lưới, bức thư
            bị xé thành 5 mảnh rách nát và gửi qua 5 tuyến liên lạc khác nhau.
            Hãy ghép nối tất cả các mảnh để đọc được Cương lĩnh chính trị!
          </p>
        </div>

        {/* Tutorial - shown below mission brief */}
        <div className="tutorial-panel">
          <div className="dossier-card-accent" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <h3>Hướng dẫn chơi</h3>
          <ul>
            <li>Có 5 mảnh giấy xé rách không đều cần được ghép lại</li>
            <li>
              Kéo thả từng mảnh về đúng vị trí để ghép lại thành một tờ báo
            </li>
            <li>Ghép đúng toàn bộ 5 mảnh để câu chữ liền mạch và có nghĩa</li>
            <li>Trả lời câu hỏi lịch sử chính xác để hoàn thành nhiệm vụ</li>
          </ul>
        </div>

        {/* Password form - shown at top after successful assembly */}
        {showPassword && (
          <div className="password-form-container">
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="dossier-card-accent" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <p className="password-form__eyebrow">Xác minh địa điểm bí mật</p>
              <h3>Câu hỏi lịch sử</h3>
              <p className="question">
                Tháng 5 năm 1930, Hội nghị hợp nhất ba tổ chức cộng sản và thông
                qua Cương lĩnh chính trị đầu tiên của Đảng Cộng sản Việt Nam đã
                diễn ra tại địa điểm bí mật nào?
              </p>
              <input
                type="text"
                className="password-input"
                placeholder="Nhập tên địa điểm (tiếng Việt hoặc tiếng Anh)..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="submit-btn">
                Xác nhận
              </button>
            </form>
          </div>
        )}

        <div
          className="game-canvas"
          ref={gameRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="assembly-sheet" aria-hidden>
            <div className="assembly-sheet__grain" />
            <div className="assembly-sheet__margin" />
            <div className="assembly-sheet__holes">
              <span />
              <span />
              <span />
            </div>
            <div className="assembly-sheet__header">
              <span className="assembly-sheet__code">TS-1930-CUU-LONG</span>
              <span className="assembly-sheet__status">Bản ghép phục dựng</span>
            </div>
          </div>

          <div className="target-slots-container" aria-hidden>
            {fragments.map((fragment) => {
              const targetPos = getTargetPosition(
                fragment.id,
                canvasWidth,
                viewportWidth,
              );

              return (
                <div
                  key={`slot-${fragment.id}`}
                  className={`target-slot target-slot-${fragment.id} ${
                    fragment.aligned ? "filled" : ""
                  }`}
                  style={{
                    left: `${targetPos.x}px`,
                    top: `${targetPos.y}px`,
                  }}
                />
              );
            })}
          </div>

          {/* Draggable fragments - no target slot guides */}
          {fragments.map((fragment) => {
              const resolvedPosition = fragment.aligned
                ? getTargetPosition(fragment.id, canvasWidth, viewportWidth)
                : fragment.currentPos;

              return (
                <div
                  key={fragment.id}
                  className={`fragment fragment-${fragment.id} ${fragment.aligned ? "aligned" : ""} ${draggedId === fragment.id ? "dragging" : ""} ${kickedBack === fragment.id ? "kicked-back" : ""}`}
                  style={{
                    left: `${resolvedPosition.x}px`,
                    top: `${resolvedPosition.y}px`,
                    "--fragment-rotation": `${fragment.rotation}deg`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, fragment.id)}
                  title="Mảnh giấy mật"
                >
                  <div className="fragment-paper-grain" aria-hidden />
                  <div className="fragment-paper-margin" aria-hidden />
                  <div className="fragment-paper-holes" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="fragment-inner">
                    <div className="fragment-topline">
                      <span className="fragment-code">TS-CUU-LONG</span>
                    </div>
                    <div className="fragment-text">{fragment.text}</div>
                  </div>
                  {fragment.aligned && (
                    <div className="alignment-indicator">✓</div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Control buttons */}
        <div className="controls">
          <button type="button" className="reset-btn" onClick={resetGame}>
            Xếp lại manh mối
          </button>
          <div className="progress">
            <div className="progress-text">
              Mảnh ghép: {fragments.filter((f) => f.aligned).length}/5
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(fragments.filter((f) => f.aligned).length / 5) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {notification && (
        <div className={`notification-overlay ${notification.type}`}>
          <div className={`notification-modal ${notification.type}`}>
            <button
              className="notification-close"
              onClick={closeNotification}
              title="Đóng"
            >
              ✕
            </button>
            <div className="notification-content">
              <h2 className="notification-title">{notification.title}</h2>
              <p className="notification-message">{notification.message}</p>
            </div>
            <button className="notification-action" onClick={closeNotification}>
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FragmentPuzzlePage;
