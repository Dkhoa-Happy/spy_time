import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/FragmentPuzzle.css";
import { completeStage } from "../../../app/store/slices/appSlice";
import { ROUTES } from "@/shared/constants/routes";

const getFragmentRotation = (fragmentId) =>
  fragmentId === 1
    ? -15
    : fragmentId === 2
      ? 5
      : fragmentId === 3
        ? 12
        : fragmentId === 4
          ? -8
          : 10;

const SLOT_IDS = [1, 2, 3, 4, 5];

const getBurstOffset = (fragmentId) => {
  const offsets = {
    1: { x: -34, y: 22 },
    2: { x: 34, y: 18 },
    3: { x: -24, y: -20 },
    4: { x: 26, y: -24 },
    5: { x: 0, y: 30 },
  };

  return offsets[fragmentId] ?? { x: 0, y: 0 };
};

const getResumeRoute = (game) => {
  if (game.missionCompleted) {
    return ROUTES.missionComplete;
  }

  if (game.unlockedStage >= 3) {
    return ROUTES.stage1986;
  }

  if (game.unlockedStage === 2) {
    return ROUTES.stage1945;
  }

  return ROUTES.home;
};

const getResponsiveLayout = (viewportWidth) => {
  if (viewportWidth <= 480) {
    return {
      sheetWidth: 470,
      sheetTop: 78,
      pieceWidth: 130,
      pieceHeight: 108,
      starUpperOffsetX: 112,
      starLowerOffsetX: 82,
      starTopY: 92,
      starUpperSideY: 226,
      starLowerSideY: 386,
    };
  }

  if (viewportWidth <= 768) {
    return {
      sheetWidth: 540,
      sheetTop: 92,
      pieceWidth: 200,
      pieceHeight: 144,
      starUpperOffsetX: 132,
      starLowerOffsetX: 112,
      starTopY: 96,
      starUpperSideY: 274,
      starLowerSideY: 486,
    };
  }

  return {
    sheetWidth: 590,
    sheetTop: 110,
    pieceWidth: 220,
    pieceHeight: 156,
    starUpperOffsetX: 146,
    starLowerOffsetX: 126,
    starTopY: 106,
    starUpperSideY: 300,
    starLowerSideY: 530,
  };
};

const getSlotPosition = (slotId, canvasWidth, viewportWidth) => {
  const layout = getResponsiveLayout(viewportWidth);
  const sheetLeft = (canvasWidth - layout.sheetWidth) / 2;
  const centerX = sheetLeft + (layout.sheetWidth - layout.pieceWidth) / 2;
  const leftUpperX = centerX - layout.starUpperOffsetX;
  const rightUpperX = centerX + layout.starUpperOffsetX;
  const leftLowerX = centerX - layout.starLowerOffsetX;
  const rightLowerX = centerX + layout.starLowerOffsetX;
  const positions = {
    1: { x: centerX, y: layout.sheetTop + layout.starTopY },
    2: { x: rightUpperX, y: layout.sheetTop + layout.starUpperSideY },
    3: { x: rightLowerX, y: layout.sheetTop + layout.starLowerSideY },
    4: { x: leftLowerX, y: layout.sheetTop + layout.starLowerSideY },
    5: { x: leftUpperX, y: layout.sheetTop + layout.starUpperSideY },
  };
  const resolved = positions[slotId] ?? positions[1];

  return {
    x: Math.round(resolved.x),
    y: Math.round(resolved.y),
  };
};

const FragmentPuzzlePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const game = useSelector((state) => state.app.game);
  const [fragments, setFragments] = useState([
    {
      id: 1,
      text: "Chủ trương làm tư sản\ndân quyền cách mạng,",
      initialPos: { x: 60, y: 70 },
      currentPos: { x: 60, y: 70 },
      rotation: -15,
      aligned: false,
      placedSlotId: null,
    },
    {
      id: 2,
      text: "và thổ địa cách mạng,\nđể xây dựng",
      initialPos: { x: 620, y: 90 },
      currentPos: { x: 620, y: 90 },
      rotation: 5,
      aligned: false,
      placedSlotId: null,
    },
    {
      id: 3,
      text: "đảng thống nhất,\nhướng tới",
      initialPos: { x: 90, y: 470 },
      currentPos: { x: 90, y: 470 },
      rotation: 12,
      aligned: false,
      placedSlotId: null,
    },
    {
      id: 4,
      text: "xã hội cộng sản toàn cầu,\nđộc lập",
      initialPos: { x: 620, y: 470 },
      currentPos: { x: 620, y: 470 },
      rotation: -8,
      aligned: false,
      placedSlotId: null,
    },
    {
      id: 5,
      text: "tự do thịnh vượng.",
      initialPos: { x: 340, y: 40 },
      currentPos: { x: 340, y: 40 },
      rotation: 10,
      aligned: false,
      placedSlotId: null,
    },
  ]);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [burstedFragmentIds, setBurstedFragmentIds] = useState([]);
  const [currentRound, setCurrentRound] = useState(1); // 1 or 2
  const [crosswordAnswers, setCrosswordAnswers] = useState({
    clue1: "",
    clue2: "",
    clue3: "",
    clue4: "",
    clue5: "",
    clue6: "",
  });
  const [crosswordStatus, setCrosswordStatus] = useState({
    clue1: null, // null, "correct", "incorrect"
    clue2: null,
    clue3: null,
    clue4: null,
    clue5: null,
    clue6: null,
  });

  const crosswordClues = [
    {
      id: "clue1",
      text: "Trong giai đoạn 1936-1939, Đảng đã dẫn dắt phong trào đấu tranh đòi dân sinh, [...] và cải thiện đời sống.",
      answer: "DANCHU",
      length: 6,
    },
    {
      id: "clue2",
      text: "Đại hội Đảng lần I năm 1935 nhằm khôi phục tổ chức sau thời kỳ bị đàn áp được diễn ra tại đâu?",
      answer: "MACAO",
      length: 5,
    },
    {
      id: "clue3",
      text: "Lực lượng nào lần đầu tiên giành được quyền làm chủ ở một số địa phương trong phong trào 1930-1931?",
      answer: "QUANCHUNG",
      length: 9,
    },
    {
      id: "clue4",
      text: "Tên tổ chức Mặt trận được thành lập theo quyết định của Hội nghị Trung ương 8 (5/1941) để mở rộng lực lượng?",
      answer: "VIETMINH",
      length: 8,
    },
    {
      id: "clue5",
      text: "Phong trào [_______] Nghệ Tĩnh được coi là đỉnh cao của cách mạng những năm 1930-1931.",
      answer: "XOVIET",
      length: 6,
    },
    {
      id: "clue6",
      text: "Tên gọi của loại văn bản được ban hành ngày 12/3/1945 ('... Nhật - Pháp bắn nhau...') nhằm chuẩn bị trực tiếp cho Tổng khởi nghĩa?",
      answer: "CHITHI",
      length: 6,
    },
  ];
  const gameRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const [canvasWidth, setCanvasWidth] = useState(980);
  const SNAP_DISTANCE = 95;
  const resumeRoute = getResumeRoute(game);
  const canReturnToCurrentStage = game.completedStages.includes(2);

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

  useEffect(() => {
    if (burstedFragmentIds.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setBurstedFragmentIds([]);
    }, 450);

    return () => clearTimeout(timer);
  }, [burstedFragmentIds]);

  const handleMouseDown = (e, fragmentId) => {
    const fragment = fragments.find((f) => f.id === fragmentId);
    if (fragment?.aligned) return;
    const gameRect = gameRef.current.getBoundingClientRect();

    setFragments((prev) =>
      prev.map((frag) =>
        frag.id === fragmentId ? { ...frag, placedSlotId: null } : frag,
      ),
    );

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

    let nearestSlotId = null;
    let minDistance = SNAP_DISTANCE;

    SLOT_IDS.forEach((slotId) => {
      const slotPos = getSlotPosition(slotId, canvasWidth, viewportWidth);
      const distance = Math.sqrt(
        Math.pow(draggedFragment.currentPos.x - slotPos.x, 2) +
          Math.pow(draggedFragment.currentPos.y - slotPos.y, 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestSlotId = slotId;
      }
    });

    if (nearestSlotId !== null) {
      const slotOccupied = fragments.some(
        (frag) => frag.id !== draggedId && frag.placedSlotId === nearestSlotId,
      );

      if (!slotOccupied) {
        const slotPos = getSlotPosition(
          nearestSlotId,
          canvasWidth,
          viewportWidth,
        );
        setFragments((prev) =>
          prev.map((frag) =>
            frag.id === draggedId
              ? {
                  ...frag,
                  currentPos: slotPos,
                  placedSlotId: nearestSlotId,
                }
              : frag,
          ),
        );
      }
    }

    setDraggedId(null);
  };

  const handlePlacementConfirm = () => {
    if (draggedId !== null) {
      return;
    }

    const placedFragments = fragments.filter(
      (frag) => frag.placedSlotId !== null,
    );
    const placedCount = placedFragments.length;
    const correctCount = placedFragments.filter(
      (frag) => frag.placedSlotId === frag.id,
    ).length;
    const allPlaced = placedCount === fragments.length;
    const allCorrect = allPlaced && correctCount === fragments.length;

    if (allCorrect) {
      setBurstedFragmentIds([]);
      setFragments((prev) =>
        prev.map((frag) => ({
          ...frag,
          currentPos: {
            ...getSlotPosition(frag.placedSlotId, canvasWidth, viewportWidth),
          },
          aligned: true,
          rotation: 0,
        })),
      );

      setShowPassword(true);
      setNotification({
        type: "success",
        context: "placement-success",
        title: "✓ ĐÃ CỐ ĐỊNH XONG!",
        message:
          "Toàn bộ 5 mảnh đã vào đủ vị trí. Trả lời câu hỏi lịch sử để mở khóa ải tiếp theo.",
      });
      return;
    }

    const placedIds = placedFragments.map((frag) => frag.id);

    if (placedIds.length > 0) {
      setBurstedFragmentIds(placedIds);
    }

    setFragments((prev) =>
      prev.map((frag) => {
        if (frag.placedSlotId === null) {
          return {
            ...frag,
            aligned: false,
            rotation: getFragmentRotation(frag.id),
          };
        }

        const burstOffset = getBurstOffset(frag.id);
        return {
          ...frag,
          currentPos: {
            x: frag.initialPos.x + burstOffset.x,
            y: frag.initialPos.y + burstOffset.y,
          },
          placedSlotId: null,
          aligned: false,
          rotation: getFragmentRotation(frag.id),
        };
      }),
    );

    if (!allPlaced) {
      setNotification({
        type: "error",
        context: "placement-progress",
        title: "Chưa đặt đủ mảnh",
        message: `Mới có ${placedCount}/5 mảnh nằm trong các vị trí ngôi sao 5 cánh. Hãy kéo đủ rồi xác nhận lại.`,
      });
      return;
    }

    setNotification({
      type: "error",
      context: "placement-progress",
      title: "Sai thứ tự mảnh ghép",
      message: `Bạn đã đặt đủ 5/5 mảnh nhưng chỉ đúng ${correctCount}/5 vị trí. Hãy ghép theo đúng số thứ tự trên khung (mảnh 1 vào ô 1, ..., mảnh 5 vào ô 5).`,
    });
  };

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
        context: "password-success",
        title: "✓ CHÍNH XÁC!",
        message:
          "Hội nghị hợp nhất đã diễn ra thành công. Đảng cộng sản Việt Nam được thành lập!",
      });
      // Transition to Round 2 (Crossword puzzle)
      setTimeout(() => {
        setShowPassword(false);
        setPassword("");
        setNotification(null);
        setCurrentRound(2);
      }, 1500);
    } else {
      setNotification({
        type: "error",
        context: "password-error",
        title: "✗ SAI RỒI!",
        message: "Hãy thử lại. ",
      });
    }
  };

  const handleCrosswordAnswerChange = (clueId, value) => {
    setCrosswordAnswers((prev) => ({
      ...prev,
      [clueId]: value,
    }));
  };

  const validateCrosswordClue = (clueId, answerValue = null) => {
    const clue = crosswordClues.find((c) => c.id === clueId);
    if (!clue) return;

    // Use provided answerValue if available, otherwise read from state
    const userAnswer = (answerValue || crosswordAnswers[clueId])
      .toUpperCase()
      .trim()
      .replace(/\s+/g, "");
    const isCorrect = userAnswer === clue.answer && userAnswer.length > 0;

    setCrosswordStatus((prev) => ({
      ...prev,
      [clueId]: isCorrect
        ? "correct"
        : userAnswer.length > 0
          ? "incorrect"
          : null,
    }));

    // Auto-clear incorrect answers after 800ms
    if (!isCorrect && userAnswer.length > 0) {
      setTimeout(() => {
        setCrosswordAnswers((prev) => ({
          ...prev,
          [clueId]: "",
        }));
        setCrosswordStatus((prev) => ({
          ...prev,
          [clueId]: null,
        }));
      }, 800);
    }
  };

  const checkAllCrosswordCorrect = () => {
    return Object.values(crosswordStatus).every(
      (status) => status === "correct",
    );
  };

  const closeNotification = () => {
    if (notification?.context === "password-success") {
      setTimeout(() => {
        setShowPassword(false);
        setPassword("");
        setNotification(null);
        setCurrentRound(2);
      }, 300);
    } else if (notification?.context === "crossword-success") {
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
        placedSlotId: null,
        rotation: getFragmentRotation(frag.id),
      })),
    );
    setShowPassword(false);
    setPassword("");
    setBurstedFragmentIds([]);
    setNotification(null);
    setCurrentRound(1);
    setCrosswordAnswers({
      clue1: "",
      clue2: "",
      clue3: "",
      clue4: "",
      clue5: "",
      clue6: "",
    });
  };

  return (
    <div className="fragment-puzzle-container">
      <div className="bunker-backdrop"></div>

      <div className="game-panel">
        <div
          className="mission-brief"
          style={{ display: currentRound === 2 ? "none" : "block" }}
        >
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
        <div
          className="tutorial-panel"
          style={{ display: currentRound === 2 ? "none" : "block" }}
        >
          <div className="dossier-card-accent" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <h3>Hướng dẫn chơi</h3>
          <ul>
            <li>Có 5 mảnh giấy xé rách không đều cần được ghép lại</li>
            <li>Kéo từng mảnh vào bố cục ngôi sao 5 cánh trên cuốn nhật ký</li>
            <li>Bấm nút xác nhận để hệ thống kiểm tra và khóa các mảnh đúng</li>
            <li>Trả lời câu hỏi lịch sử chính xác để hoàn thành nhiệm vụ</li>
          </ul>
        </div>

        {/* Password form - shown at top after successful assembly */}
        {showPassword && currentRound === 1 && (
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

        {/* Crossword puzzle form - shown after password success */}
        {currentRound === 2 && (
          <div className="crossword-form-container">
            <div className="crossword-header">
              <h2>VÒNG 2: GIẢI Ô CHỮ LỊCH SỬ</h2>
              <p className="crossword-instruction">
                Nhập từng ký tự vào các ô tương ứng
              </p>
            </div>

            <div className="crossword-clues-grid">
              {crosswordClues.map((clue) => (
                <div key={clue.id} className="crossword-clue-block">
                  <div className="clue-question">{clue.text}</div>

                  <div className="crossword-grid-container">
                    <div className="crossword-grid">
                      {Array.from({ length: clue.length }).map((_, idx) => (
                        <input
                          key={`${clue.id}-${idx}`}
                          type="text"
                          className={`crossword-cell ${crosswordStatus[clue.id] === "correct" ? "correct" : ""} ${crosswordStatus[clue.id] === "incorrect" ? "incorrect" : ""}`}
                          maxLength="1"
                          value={crosswordAnswers[clue.id][idx] || ""}
                          onChange={(e) => {
                            const newAnswer = (
                              crosswordAnswers[clue.id] || ""
                            ).split("");
                            newAnswer[idx] = e.target.value.toUpperCase();
                            const fullAnswer = newAnswer
                              .slice(0, clue.length)
                              .join("");

                            handleCrosswordAnswerChange(clue.id, fullAnswer);

                            // Auto-focus to next cell
                            if (e.target.value && idx < clue.length - 1) {
                              const nextInput =
                                e.target.parentElement?.children?.[idx + 1];
                              nextInput?.focus?.();
                            }

                            // Auto-validate when all cells filled after a short delay
                            if (
                              fullAnswer.length === clue.length &&
                              e.target.value
                            ) {
                              setTimeout(() => {
                                validateCrosswordClue(clue.id, fullAnswer);
                              }, 50);
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace to focus previous cell
                            if (
                              e.key === "Backspace" &&
                              !e.target.value &&
                              idx > 0
                            ) {
                              const prevInput =
                                e.target.parentElement?.children?.[idx - 1];
                              prevInput?.focus?.();
                            }
                            // Handle arrow keys for navigation
                            if (
                              e.key === "ArrowRight" &&
                              idx < clue.length - 1
                            ) {
                              e.target.parentElement?.children?.[
                                idx + 1
                              ]?.focus?.();
                            }
                            if (e.key === "ArrowLeft" && idx > 0) {
                              e.target.parentElement?.children?.[
                                idx - 1
                              ]?.focus?.();
                            }
                          }}
                          autoFocus={
                            idx === 0 && crosswordClues.indexOf(clue) === 0
                          }
                        />
                      ))}
                    </div>

                    {crosswordStatus[clue.id] && (
                      <div
                        className={`clue-status ${crosswordStatus[clue.id]}`}
                      >
                        {crosswordStatus[clue.id] === "correct" ? (
                          <span className="status-icon correct">✓</span>
                        ) : (
                          <span className="status-icon incorrect">✗</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {checkAllCrosswordCorrect() && (
              <div className="crossword-complete-actions">
                <button
                  type="button"
                  className="continue-btn"
                  onClick={() => {
                    dispatch(completeStage(1));
                    setNotification({
                      type: "success",
                      context: "crossword-success",
                      title: "✓ VÒNG 2 HOÀN THÀNH!",
                      message:
                        "Bạn đã giải ô chữ lịch sử thành công! Đông đảo quần chúng tham gia phong trào cách mạng.",
                    });
                    setTimeout(() => {
                      navigate(ROUTES.stage1945);
                    }, 1500);
                  }}
                >
                  Tiếp tục
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className="game-canvas"
          ref={gameRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ display: currentRound === 2 ? "none" : "block" }}
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
            {SLOT_IDS.map((slotId) => {
              const targetPos = getSlotPosition(
                slotId,
                canvasWidth,
                viewportWidth,
              );
              const filled = fragments.some(
                (fragment) =>
                  fragment.aligned && fragment.placedSlotId === slotId,
              );

              return (
                <div
                  key={`slot-${slotId}`}
                  className={`target-slot target-slot-${slotId} ${
                    filled ? "filled" : ""
                  }`}
                  style={{
                    left: `${targetPos.x}px`,
                    top: `${targetPos.y}px`,
                  }}
                >
                  <span className="target-slot-number">{slotId}</span>
                </div>
              );
            })}
          </div>

          {/* Draggable fragments - no target slot guides */}
          {fragments.map((fragment) => {
            const resolvedPosition = fragment.aligned
              ? getSlotPosition(
                  fragment.placedSlotId ?? fragment.id,
                  canvasWidth,
                  viewportWidth,
                )
              : fragment.currentPos;

            return (
              <div
                key={fragment.id}
                className={`fragment fragment-${fragment.id} ${fragment.aligned ? "aligned" : ""} ${draggedId === fragment.id ? "dragging" : ""} ${burstedFragmentIds.includes(fragment.id) ? "kicked-back" : ""}`}
                style={{
                  left: `${resolvedPosition.x}px`,
                  top: `${resolvedPosition.y}px`,
                  "--fragment-rotation": `${fragment.rotation}deg`,
                }}
                onMouseDown={(e) => handleMouseDown(e, fragment.id)}
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
              </div>
            );
          })}

          <div className="canvas-confirm-action">
            <button
              type="button"
              className="confirm-btn"
              onClick={handlePlacementConfirm}
              disabled={showPassword || draggedId !== null}
            >
              Xác nhận vị trí ghép
            </button>
          </div>
        </div>

        {/* Control buttons */}
        <div
          className="controls"
          style={{ display: currentRound === 2 ? "none" : "block" }}
        >
          <p className="placement-hint">
            Sắp 5 mảnh vào ngôi sao 5 cánh rồi bấm xác nhận để kiểm tra.
          </p>
          {canReturnToCurrentStage && (
            <button
              type="button"
              className="reset-btn"
              onClick={() => navigate(resumeRoute)}
            >
              Về ải đang chơi
            </button>
          )}
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
