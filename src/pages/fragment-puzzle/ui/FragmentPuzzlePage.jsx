import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants/routes";
import "../styles/FragmentPuzzle.css";

const FragmentPuzzlePage = () => {
  const navigate = useNavigate();
  const [fragments, setFragments] = useState([
    {
      id: 1,
      text: "Chủ trương làm tư sản\ndân quyền cách mạng...",
      initialPos: { x: 40, y: 20 },
      currentPos: { x: 40, y: 20 },
      targetPos: { x: 65, y: 330 },
      rotation: -15,
      aligned: false,
      org: "Đương Dương CS Đảng",
    },
    {
      id: 2,
      text: "...và thổ địa\ncách mạng...",
      initialPos: { x: 420, y: 20 },
      currentPos: { x: 420, y: 20 },
      targetPos: { x: 325, y: 330 },
      rotation: 5,
      aligned: false,
      org: "An Nam CS Đảng",
    },
    {
      id: 3,
      text: "...để xây dựng\ndảng thống nhất...",
      initialPos: { x: 500, y: 20 },
      currentPos: { x: 500, y: 20 },
      targetPos: { x: 585, y: 330 },
      rotation: 12,
      aligned: false,
      org: "Hồng Kông CS Đảng",
    },
    {
      id: 4,
      text: "...hướng tới xã hội\ncộng sản toàn cầu...",
      initialPos: { x: 150, y: 120 },
      currentPos: { x: 150, y: 120 },
      targetPos: { x: 160, y: 440 },
      rotation: -8,
      aligned: false,
      org: "Mặt trận đoàn kết",
    },
    {
      id: 5,
      text: "...độc lập tự do\nthịnh vượng.",
      initialPos: { x: 380, y: 120 },
      currentPos: { x: 380, y: 120 },
      targetPos: { x: 420, y: 440 },
      rotation: 10,
      aligned: false,
      org: "Tuyên ngôn chính trị",
    },
  ]);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [assembled, setAssembled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUnifiedDocument, setShowUnifiedDocument] = useState(false);
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [rejectedFragmentId, setRejectedFragmentId] = useState(null);
  const gameRef = useRef(null);
  const SNAP_DISTANCE = 40;

  const handleMouseDown = (e, fragmentId) => {
    const fragment = fragments.find((f) => f.id === fragmentId);
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

      if (distance < minDistance) {
        minDistance = distance;
        nearestSlot = frag;
      }
    });

    if (nearestSlot) {
      if (nearestSlot.id === draggedId) {
        // Correct piece in correct slot
        setFragments((prev) =>
          prev.map((frag) =>
            frag.id === draggedId
              ? {
                  ...frag,
                  currentPos: { ...frag.targetPos },
                  aligned: true,
                  rotation: 0,
                }
              : frag,
          ),
        );
      } else {
        // Wrong piece - trigger rejection animation
        setRejectedFragmentId(draggedId);

        // Reset position after animation completes
        setTimeout(() => {
          setRejectedFragmentId(null);
          setFragments((prev) =>
            prev.map((frag) =>
              frag.id === draggedId
                ? {
                    ...frag,
                    currentPos: { ...frag.initialPos },
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
                  }
                : frag,
            ),
          );
        }, 650);
      }
    }

    setDraggedId(null);
  };

  // Check if all fragments are aligned
  useEffect(() => {
    const allAligned = fragments.every((f) => f.aligned);
    if (allAligned && !assembled) {
      setAssembled(true);
      setShowUnifiedDocument(true);
      // Show password form after assembly
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
    setShowUnifiedDocument(false);
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
            bị xé thành 5 mảnh và gửi qua 5 tuyến liên lạc khác nhau. Hãy ghép
            nối tất cả các mảnh để đọc được Cương lĩnh chính trị!
          </p>
        </div>

        <div
          className="game-canvas"
          ref={gameRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Target slots for dropping fragments */}
          <div className="target-slots-container">
            {fragments.map((frag, idx) => (
              <div
                key={`slot-${frag.id}`}
                className={`target-slot ${frag.aligned ? "filled" : ""}`}
                style={{
                  left: `${frag.targetPos.x}px`,
                  top: `${frag.targetPos.y}px`,
                }}
              >
                <div className="slot-number">{idx + 1}</div>
                <div className="slot-label">Mảnh {idx + 1}</div>
              </div>
            ))}
          </div>

          {/* Render fragments */}
          {fragments.map((fragment) => (
            <div
              key={fragment.id}
              className={`fragment ${fragment.aligned ? "aligned" : ""} ${draggedId === fragment.id ? "dragging" : ""} ${rejectedFragmentId === fragment.id ? "rejected" : ""}`}
              style={{
                left: `${fragment.currentPos.x}px`,
                top: `${fragment.currentPos.y}px`,
                transform: `rotate(${fragment.rotation}deg)`,
              }}
              onMouseDown={(e) => handleMouseDown(e, fragment.id)}
            >
              <div className="fragment-inner">
                <div className="fragment-text">{fragment.text}</div>
                <div className="fragment-label">{fragment.org}</div>
              </div>
              {fragment.aligned && <div className="alignment-indicator">✓</div>}
            </div>
          ))}

          {/* Completed document message - shows complete sentence */}
          {showUnifiedDocument && (
            <div className="unified-document">
              <button
                className="close-modal-btn"
                onClick={() => setShowUnifiedDocument(false)}
                title="Đóng"
              >
                ✕
              </button>
              <div className="seal-animation">
                <div className="red-seal">HỢP NHẤT</div>
              </div>
              <div className="hidden-message">
                <p>✓ Tất cả 5 mảnh đã được ghép thành công!</p>
                <p>Cương lĩnh chính trị đã hoàn chỉnh.</p>
                <div className="complete-sentence">
                  <p>
                    <strong>Cương lĩnh chính trị:</strong>
                  </p>
                  <p>
                    "Chủ trương làm tư sản dân quyền cách mạng, và thổ địa cách
                    mạng, để xây dựng đảng thống nhất, hướng tới xã hội cộng sản
                    toàn cầu, độc lập tự do thịnh vượng."
                  </p>
                </div>
                <p style={{ marginTop: "20px", fontSize: "0.9em" }}>
                  Hãy trả lời câu hỏi dưới đây để hoàn thành nhiệm vụ.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tutorial */}
        <div className="tutorial-panel">
          <h3>📖 Hướng dẫn chơi:</h3>
          <ul>
            <li>Có 5 mảnh ghép cần được sắp xếp vào 5 ô trống được đánh số</li>
            <li>Kéo thả các mảnh giấy vào ô tương ứng</li>
            <li>Ghép đúng toàn bộ 5 mảnh để mở khoá câu hỏi lịch sử</li>
            <li>Trả lời câu hỏi chính xác để hoàn thành nhiệm vụ</li>
          </ul>
        </div>

        {/* Password form - shown after successful assembly */}
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
