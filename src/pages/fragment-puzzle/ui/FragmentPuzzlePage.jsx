import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FragmentPuzzle.css";
import { ROUTES } from "@/shared/constants/routes";

const FragmentPuzzlePage = () => {
  const navigate = useNavigate();
  const [fragments, setFragments] = useState([
    {
      id: 1,
      text: "Chủ trương làm tư sản\ndân quyền cách mạng,",
      initialPos: { x: 60, y: 70 },
      currentPos: { x: 60, y: 70 },
      targetPos: { x: 150, y: 80 },
      rotation: -15,
      aligned: false,
    },
    {
      id: 2,
      text: "và thổ địa cách mạng,\nđể xây dựng",
      initialPos: { x: 620, y: 90 },
      currentPos: { x: 620, y: 90 },
      targetPos: { x: 420, y: 80 },
      rotation: 5,
      aligned: false,
    },
    {
      id: 3,
      text: "đảng thống nhất,\nhướng tới",
      initialPos: { x: 90, y: 470 },
      currentPos: { x: 90, y: 470 },
      targetPos: { x: 150, y: 280 },
      rotation: 12,
      aligned: false,
    },
    {
      id: 4,
      text: "xã hội cộng sản toàn cầu,\nđộc lập",
      initialPos: { x: 620, y: 470 },
      currentPos: { x: 620, y: 470 },
      targetPos: { x: 420, y: 280 },
      rotation: -8,
      aligned: false,
    },
    {
      id: 5,
      text: "tự do thịnh vượng.",
      initialPos: { x: 340, y: 40 },
      currentPos: { x: 340, y: 40 },
      targetPos: { x: 285, y: 480 },
      rotation: 10,
      aligned: false,
    },
  ]);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [kickedBack, setKickedBack] = useState(null);
  const [assembled, setAssembled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [rejectedFragmentId, setRejectedFragmentId] = useState(null);
  const gameRef = useRef(null);
  const SNAP_DISTANCE = 95;

  const handleMouseDown = (e, fragmentId) => {
    const fragment = fragments.find((f) => f.id === fragmentId);
    if (fragment?.aligned) return;
    const rect = e.currentTarget.getBoundingClientRect();
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

    // Find nearest target slot to current position
    let nearestSlot = null;
    let minDistance = SNAP_DISTANCE;

    fragments.forEach((frag) => {
      const distance = Math.sqrt(
        Math.pow(draggedFragment.currentPos.x - frag.targetPos.x, 2) +
          Math.pow(draggedFragment.currentPos.y - frag.targetPos.y, 2),
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

  // Check if all fragments are aligned
  useEffect(() => {
    const allAligned = fragments.every((f) => f.aligned);
    if (allAligned && !assembled) {
      setAssembled(true);
      setTimeout(() => {
        setShowPassword(true);
      }, 1000);
    }
  }, [fragments, assembled]);

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
        rotation:
          frag.id === 1
            ? -15
            : frag.id === 2
              ? 5
              : frag.id === 3
                ? 12
                : frag.id === 4
                  ? -8
                  : 10,
      })),
    );
    setAssembled(false);
    setShowPassword(false);
    setPassword("");
  };

  return (
    <div className="fragment-puzzle-container">
      <div className="bunker-backdrop"></div>

      <div className="game-panel">
        <div className="mission-brief">
          <h1>🔐 Mật lệnh Cửu Long (1930)</h1>
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
          <h3>📖 Hướng dẫn chơi:</h3>
          <ul>
            <li>Có 5 mảnh giấy xé rách không đều cần được ghép lại</li>
            <li>Kéo thả từng mảnh về đúng vị trí để ghép lại thành một tờ báo</li>
            <li>Ghép đúng toàn bộ 5 mảnh để câu chữ liền mạch và có nghĩa</li>
            <li>Trả lời câu hỏi lịch sử chính xác để hoàn thành nhiệm vụ</li>
          </ul>
        </div>

        {/* Password form - shown at top after successful assembly */}
        {showPassword && (
          <div className="password-form-container">
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <h3>🔑 Câu hỏi lịch sử:</h3>
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
          {/* Draggable fragments - no target slot guides */}
          {fragments.map((fragment) => (
            <div
              key={fragment.id}
              className={`fragment fragment-${fragment.id} ${fragment.aligned ? "aligned" : ""} ${draggedId === fragment.id ? "dragging" : ""} ${kickedBack === fragment.id ? "kicked-back" : ""}`}
              style={{
                left: `${fragment.currentPos.x}px`,
                top: `${fragment.currentPos.y}px`,
                transform: `rotate(${fragment.rotation}deg)`,
              }}
              onMouseDown={(e) => handleMouseDown(e, fragment.id)}
              title={`Mảnh ${fragment.id}`}
            >
              <div className="fragment-inner">
                <div className="fragment-text">{fragment.text}</div>
              </div>
              {fragment.aligned && <div className="alignment-indicator">✓</div>}
            </div>
          ))}
        </div>

        {/* Control buttons */}
        <div className="controls">
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
