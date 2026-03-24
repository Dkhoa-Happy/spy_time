import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  FileImage,
  FileText,
  LockKeyhole,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";

import { completeStage } from "../../../app/store/slices/appSlice";
import { ROUTES } from "../../../shared/constants/routes";
import { cn } from "../../../shared/lib/utils";
import { Button } from "../../../shared/ui/button";
import { AdventureStoryOverlay } from "./AdventureStoryOverlay";
import { normalizeAnswer } from "../lib/gameConfig";
import {
  createShuffledStage1945Deck,
  getStage1945Milestone,
  STAGE_1945_MILESTONES,
  STAGE_1945_MORSE_PUZZLES,
  STAGE_1945_TOTAL_PAIRS,
} from "../lib/stage1945GameConfig";

const resolveDelayMs = 850;
const dotBeepMs = 110;
const dashBeepMs = 260;
const signalPauseMs = 100;
const wordPauseMs = 220;
const maxMemoryMisses = 10;

const ROOM_PAGES = {
  morse: "morse",
  memory: "memory",
};

const STAGE_1945_KEYWORD_TARGETS = STAGE_1945_MILESTONES.filter(
  (milestone) =>
    Boolean(milestone.morsePuzzle) &&
    Array.isArray(milestone.infoTextParts) &&
    milestone.infoTextParts.length === 2,
);

const createEmptyKeywordAssignments = () =>
  Object.fromEntries(
    STAGE_1945_KEYWORD_TARGETS.map((milestone) => [milestone.id, ""]),
  );

const getPuzzleDisplayLabel = (puzzle) =>
  puzzle?.keywordLabel || puzzle?.solvedKeyword || "";

const sleep = (durationMs) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });

const playTone = (audioContext, durationMs) =>
  new Promise((resolve) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 740;
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.15,
      audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + durationMs / 1000,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + durationMs / 1000 + 0.03);

    window.setTimeout(resolve, durationMs);
  });

const Stage1945KeywordSlot = ({
  assignedPuzzle,
  isCorrect,
  isInteractive,
  isHighlighted,
  onClick,
  onDrop,
  onDragOver,
}) => {
  const slotLabel = assignedPuzzle
    ? getPuzzleDisplayLabel(assignedPuzzle)
    : isInteractive
      ? "Thả từ khóa"
      : "Ô khuyết";
  const className = cn(
    "mx-1 inline-flex min-h-9 min-w-[8.4rem] items-center justify-center rounded-[0.8rem] border px-3 py-1.5 text-center font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] align-middle transition",
    assignedPuzzle
      ? isCorrect
        ? "border-emerald-400/35 bg-emerald-200/25 text-[#2e5a35]"
        : "border-red-400/35 bg-red-200/25 text-[#6b271d]"
      : isInteractive
        ? isHighlighted
          ? "border-cyan-400/35 bg-cyan-200/20 text-[#215468]"
          : "border-[#8b6532]/28 bg-white/45 text-[#6f4d29] hover:bg-white/60"
        : "border-[#8b6532]/18 bg-white/25 text-[#8f6c43]/80",
  );

  if (!isInteractive) {
    return <span className={className}>{slotLabel}</span>;
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      aria-label="Ô gắn từ khóa"
    >
      {slotLabel}
    </button>
  );
};

const Stage1945InfoText = ({
  milestone,
  assignedPuzzle,
  isSlotCorrect,
  isSlotInteractive,
  isSlotHighlighted,
  onSlotClick,
  onSlotDrop,
  onSlotDragOver,
  className,
}) => {
  if (!milestone.infoTextParts || !milestone.morsePuzzle) {
    return <p className={className}>{milestone.infoText}</p>;
  }

  return (
    <p className={className}>
      {milestone.infoTextParts[0]}
      <Stage1945KeywordSlot
        assignedPuzzle={assignedPuzzle}
        isCorrect={isSlotCorrect}
        isInteractive={isSlotInteractive}
        isHighlighted={isSlotHighlighted}
        onClick={onSlotClick}
        onDrop={onSlotDrop}
        onDragOver={onSlotDragOver}
      />
      {milestone.infoTextParts[1]}
    </p>
  );
};

const Stage1945ImageFace = ({ milestone }) => {
  return (
    <div className="flex h-full flex-col gap-2.5 sm:gap-3">
      <div className="flex shrink-0 items-center justify-between gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#76512b] sm:text-[0.64rem] sm:tracking-[0.18em]">
        <span className="inline-flex items-center gap-1.5">
          <FileImage className="size-3.5" />
          Thẻ hình ảnh
        </span>
        {milestone.isFeatured && (
          <span className="rounded-full border border-amber-400/40 bg-amber-200/20 px-2 py-1 text-[#8a6112]">
            Trọng điểm
          </span>
        )}
      </div>

      {milestone.imageSrc ? (
        <div className="min-h-[12.5rem] flex-1 overflow-hidden rounded-[1rem] border border-[#8d6130]/25 bg-[#e9d2aa]/70 sm:min-h-[14rem]">
          <img
            alt={`Tư liệu minh họa ${milestone.title}`}
            className="h-full w-full object-cover object-top"
            src={milestone.imageSrc}
          />
        </div>
      ) : (
        <div
          className={`stage-1945-image-placeholder stage-1945-image-placeholder--${milestone.placeholderVariant} min-h-[12.5rem] flex-1 sm:min-h-[14rem]`}
        >
          <span className="stage-1945-image-placeholder__grain" />
          <span className="stage-1945-image-placeholder__frame" />
          <span className="stage-1945-image-placeholder__subject" />
          <span className="stage-1945-image-placeholder__stamp" />
        </div>
      )}
    </div>
  );
};

const Stage1945InfoFace = ({
  milestone,
  assignedPuzzle,
  isSlotCorrect,
  isSlotInteractive,
  isSlotHighlighted,
  onSlotClick,
  onSlotDrop,
  onSlotDragOver,
}) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#76512b] sm:text-[0.64rem] sm:tracking-[0.18em]">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-3.5" />
          Thẻ thông tin
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-1 font-mono text-[0.56rem] tracking-[0.12em] sm:text-[0.64rem] sm:tracking-[0.14em]",
            milestone.isFeatured
              ? "border-amber-400/45 bg-amber-200/25 text-[#85590f]"
              : "border-[#8b6532]/18 bg-white/40 text-[#6b4725]",
          )}
        >
          {milestone.dateLabel}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-bold tracking-tight text-[#2f1d0c] xl:text-xl">
        {milestone.title}
      </h3>
      <Stage1945InfoText
        milestone={milestone}
        assignedPuzzle={assignedPuzzle}
        isSlotCorrect={isSlotCorrect}
        isSlotInteractive={isSlotInteractive}
        isSlotHighlighted={isSlotHighlighted}
        onSlotClick={onSlotClick}
        onSlotDrop={onSlotDrop}
        onSlotDragOver={onSlotDragOver}
        className="mt-3 text-[0.75rem] leading-5 text-[#412a12] sm:text-[0.84rem] sm:leading-6"
      />

      {milestone.isFeatured && (
        <div className="mt-auto pt-4">
          <span className="rounded-full border border-amber-400/40 bg-amber-200/25 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#85590f] sm:text-[0.68rem] sm:tracking-[0.14em]">
            Thẻ trọng điểm
          </span>
        </div>
      )}
    </div>
  );
};

export const Stage1945MemoryRoom = ({
  stageTitle = "Stage 2: Mặt trận 1945",
  stageDescription = "",
  onBack,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(ROOM_PAGES.morse);
  const [deck, setDeck] = useState(() => createShuffledStage1945Deck());
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [turnCount, setTurnCount] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [morseInputs, setMorseInputs] = useState(() =>
    Object.fromEntries(
      STAGE_1945_MORSE_PUZZLES.map((puzzle) => [puzzle.id, ""]),
    ),
  );
  const [morseFeedback, setMorseFeedback] = useState({});
  const [solvedMorseIds, setSolvedMorseIds] = useState([]);
  const [slotAssignments, setSlotAssignments] = useState(() =>
    createEmptyKeywordAssignments(),
  );
  const [playingPuzzleId, setPlayingPuzzleId] = useState("");
  const [draggedKeywordId, setDraggedKeywordId] = useState("");
  const [selectedKeywordId, setSelectedKeywordId] = useState("");
  const [failedPairCount, setFailedPairCount] = useState(0);
  const [memoryBoardNotice, setMemoryBoardNotice] = useState("");
  const [showMorseHint, setShowMorseHint] = useState(false);
  const resolveTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const hasCompletedStageRef = useRef(false);

  useEffect(() => {
    return () => {
      if (resolveTimeoutRef.current) {
        window.clearTimeout(resolveTimeoutRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const morsePuzzleLookup = Object.fromEntries(
    STAGE_1945_MORSE_PUZZLES.map((puzzle) => [puzzle.id, puzzle]),
  );
  const collectedKeywordPuzzles = STAGE_1945_MORSE_PUZZLES.filter((puzzle) =>
    solvedMorseIds.includes(puzzle.id),
  );
  const matchedCount = matchedPairIds.length;
  const solvedMorseCount = solvedMorseIds.length;
  const placedKeywordCount = STAGE_1945_KEYWORD_TARGETS.filter(
    (milestone) => slotAssignments[milestone.id] === milestone.morsePuzzle.id,
  ).length;
  const isMorseComplete = solvedMorseCount === STAGE_1945_MORSE_PUZZLES.length;
  const isMemoryPairsComplete = matchedCount === STAGE_1945_TOTAL_PAIRS;
  const isKeywordPlacementComplete = STAGE_1945_KEYWORD_TARGETS.every(
    (milestone) => slotAssignments[milestone.id] === milestone.morsePuzzle.id,
  );
  const isMemoryComplete = isMemoryPairsComplete && isKeywordPlacementComplete;
  const isRoomTwoComplete = isMorseComplete && isMemoryComplete;
  const remainingMissCount = maxMemoryMisses - failedPairCount;

  const getAssignedPuzzle = (milestone) =>
    morsePuzzleLookup[slotAssignments[milestone.id]] || null;

  const isMilestoneKeywordCorrect = (milestone) => {
    if (!milestone.morsePuzzle || !milestone.infoTextParts) {
      return true;
    }

    return slotAssignments[milestone.id] === milestone.morsePuzzle.id;
  };

  const resetMemoryBoard = ({ notice = "", resetTurns = true } = {}) => {
    setDeck(createShuffledStage1945Deck());
    setMatchedPairIds([]);
    setFailedPairCount(0);
    setSlotAssignments(createEmptyKeywordAssignments());
    setDraggedKeywordId("");
    setSelectedKeywordId("");
    setMemoryBoardNotice(notice);

    if (resetTurns) {
      setTurnCount(0);
    }
  };

  const handleRestart = () => {
    if (resolveTimeoutRef.current) {
      window.clearTimeout(resolveTimeoutRef.current);
      resolveTimeoutRef.current = null;
    }

    setActivePage(ROOM_PAGES.morse);
    setDeck(createShuffledStage1945Deck());
    setMatchedPairIds([]);
    setTurnCount(0);
    setIsResolving(false);
    setMorseInputs(
      Object.fromEntries(
        STAGE_1945_MORSE_PUZZLES.map((puzzle) => [puzzle.id, ""]),
      ),
    );
    setMorseFeedback({});
    setSolvedMorseIds([]);
    setSlotAssignments(createEmptyKeywordAssignments());
    setPlayingPuzzleId("");
    setDraggedKeywordId("");
    setSelectedKeywordId("");
    setFailedPairCount(0);
    setMemoryBoardNotice("");
    setShowMorseHint(false);
    hasCompletedStageRef.current = false;
  };

  const handleConfirmStageTwoCompletion = () => {
    if (!hasCompletedStageRef.current) {
      dispatch(completeStage(2));
      hasCompletedStageRef.current = true;
    }
    navigate(ROUTES.stage1975);
  };

  const handleCardFlip = (cardId) => {
    if (isResolving) {
      return;
    }

    const selectedCard = deck.find((card) => card.id === cardId);
    if (!selectedCard || selectedCard.status !== "face-down") {
      return;
    }

    if (memoryBoardNotice) {
      setMemoryBoardNotice("");
    }

    const revealedCards = deck.filter((card) => card.status === "revealed");
    if (revealedCards.length >= 2) {
      return;
    }

    setDeck((currentDeck) =>
      currentDeck.map((card) =>
        card.id === cardId ? { ...card, status: "revealed" } : card,
      ),
    );

    if (revealedCards.length !== 1) {
      return;
    }

    const firstCard = revealedCards[0];
    const selectedIds = [firstCard.id, selectedCard.id];
    const isMatch =
      firstCard.pairId === selectedCard.pairId &&
      firstCard.cardType !== selectedCard.cardType;
    const shouldResetBoard = !isMatch && failedPairCount + 1 >= maxMemoryMisses;

    setTurnCount((currentCount) => currentCount + 1);
    setIsResolving(true);

    resolveTimeoutRef.current = window.setTimeout(() => {
      if (isMatch) {
        setDeck((currentDeck) =>
          currentDeck.map((card) => {
            if (!selectedIds.includes(card.id)) {
              return card;
            }

            return {
              ...card,
              status: "matched",
            };
          }),
        );
        setMatchedPairIds((currentPairs) =>
          currentPairs.includes(selectedCard.pairId)
            ? currentPairs
            : [...currentPairs, selectedCard.pairId],
        );
      } else if (shouldResetBoard) {
        resetMemoryBoard({
          notice:
            "Bạn đã ghép sai 10 lần. Toàn bộ thẻ đã được đóng lại và xáo lại.",
        });
      } else {
        setDeck((currentDeck) =>
          currentDeck.map((card) => {
            if (!selectedIds.includes(card.id)) {
              return card;
            }

            return {
              ...card,
              status: "face-down",
            };
          }),
        );
        setFailedPairCount((currentCount) => currentCount + 1);
      }

      setIsResolving(false);
      resolveTimeoutRef.current = null;
    }, resolveDelayMs);
  };

  const getPuzzleState = (puzzle, index) => {
    const isSolved = solvedMorseIds.includes(puzzle.id);
    const previousPuzzle =
      index > 0 ? STAGE_1945_MORSE_PUZZLES[index - 1] : null;
    const previousSolved =
      index === 0 || solvedMorseIds.includes(previousPuzzle.id);

    return {
      isSolved,
      isReady: previousSolved,
      lockReason: `Cần giải xong mật thư ${index} trước khi mở bước tiếp theo.`,
    };
  };

  const handleMorseInputChange = (puzzleId, value) => {
    setMorseInputs((currentInputs) => ({
      ...currentInputs,
      [puzzleId]: value,
    }));

    if (morseFeedback[puzzleId]) {
      setMorseFeedback((currentFeedback) => ({
        ...currentFeedback,
        [puzzleId]: null,
      }));
    }
  };

  const handleMorseSubmit = (event, puzzle, puzzleState) => {
    event.preventDefault();

    if (!puzzleState.isReady || puzzleState.isSolved) {
      return;
    }

    const inputValue = morseInputs[puzzle.id];
    const normalizedValue = normalizeAnswer(inputValue);
    const isCorrect = puzzle.acceptedAnswers.some(
      (candidate) => normalizeAnswer(candidate) === normalizedValue,
    );

    if (!isCorrect) {
      setMorseFeedback((currentFeedback) => ({
        ...currentFeedback,
        [puzzle.id]: {
          kind: "error",
          message:
            "Chưa khớp. Hãy nghe lại tín hiệu beep hoặc đọc kỹ chuỗi chấm gạch rồi nhập lại.",
        },
      }));
      return;
    }

    setSolvedMorseIds((currentSolvedIds) =>
      currentSolvedIds.includes(puzzle.id)
        ? currentSolvedIds
        : [...currentSolvedIds, puzzle.id],
    );
    setMorseFeedback((currentFeedback) => ({
      ...currentFeedback,
      [puzzle.id]: {
        kind: "success",
        message: puzzle.successMessage,
      },
    }));
  };

  const handlePlaySignal = async (puzzleId, signal) => {
    if (playingPuzzleId) {
      return;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    setPlayingPuzzleId(puzzleId);

    for (const unit of signal) {
      if (unit === ".") {
        await playTone(audioContextRef.current, dotBeepMs);
        await sleep(signalPauseMs);
        continue;
      }

      if (unit === "-") {
        await playTone(audioContextRef.current, dashBeepMs);
        await sleep(signalPauseMs);
        continue;
      }

      if (unit === "/") {
        await sleep(wordPauseMs);
        continue;
      }

      await sleep(signalPauseMs);
    }

    setPlayingPuzzleId("");
  };

  const applyKeywordAssignment = (milestoneId, puzzleId) => {
    if (!puzzleId || !solvedMorseIds.includes(puzzleId)) {
      return;
    }

    setSlotAssignments((currentAssignments) => {
      const nextAssignments = { ...currentAssignments };

      Object.keys(nextAssignments).forEach((key) => {
        if (nextAssignments[key] === puzzleId) {
          nextAssignments[key] = "";
        }
      });

      nextAssignments[milestoneId] = puzzleId;
      return nextAssignments;
    });
    setSelectedKeywordId("");
  };

  const handleKeywordTokenSelect = (puzzleId) => {
    if (!solvedMorseIds.includes(puzzleId)) {
      return;
    }

    setSelectedKeywordId((currentId) =>
      currentId === puzzleId ? "" : puzzleId,
    );
  };

  const handleKeywordTokenDragStart = (event, puzzleId) => {
    if (!solvedMorseIds.includes(puzzleId)) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("text/plain", puzzleId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedKeywordId(puzzleId);
    setSelectedKeywordId(puzzleId);
  };

  const handleKeywordTokenDragEnd = () => {
    setDraggedKeywordId("");
  };

  const handleKeywordSlotDragOver = (event, canAccept) => {
    if (!canAccept) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleKeywordSlotDrop = (event, milestoneId, canAccept) => {
    if (!canAccept) {
      return;
    }

    event.preventDefault();
    const droppedKeywordId =
      event.dataTransfer.getData("text/plain") ||
      draggedKeywordId ||
      selectedKeywordId;

    applyKeywordAssignment(milestoneId, droppedKeywordId);
    setDraggedKeywordId("");
  };

  const handleKeywordSlotClick = (milestoneId, canAccept) => {
    if (!canAccept) {
      return;
    }

    if (selectedKeywordId) {
      applyKeywordAssignment(milestoneId, selectedKeywordId);
      return;
    }

    setSlotAssignments((currentAssignments) => {
      if (!currentAssignments[milestoneId]) {
        return currentAssignments;
      }

      return {
        ...currentAssignments,
        [milestoneId]: "",
      };
    });
  };

  const roomStatus = isRoomTwoComplete
    ? "Chờ xác nhận sang Room 3 / 1975"
    : isMorseComplete
      ? "Đang ở Game 2"
      : "Đang ở Game 1";
  const isViewingMorse = activePage === ROOM_PAGES.morse;
  const isViewingMemory = activePage === ROOM_PAGES.memory;
  const headerTitle = isViewingMorse
    ? "Game 1: Giải mật Morse 1945"
    : "Game 2: Lật thẻ hồ sơ 1945";
  const headerDescription = isViewingMorse
    ? "Giải xong 3 mật thư để thu thập từ khóa. Tất cả từ khóa sẽ được mang sang game lật thẻ ở trang sau."
    : "Ghép đúng 6 cặp thẻ, sau đó kéo các từ khóa đã lấy từ game Morse vào đúng chỗ khuyết trên thẻ thông tin.";

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-[1.5rem] border border-border/75 bg-[linear-gradient(145deg,rgba(15,21,31,0.98),rgba(9,13,20,0.98))] p-5 shadow-[0_24px_58px_rgb(0_0_0_/_0.3)] sm:p-6">
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

              <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-200/6 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-amber-200">
                <Sparkles className="size-4" />
                Room 2 / 1945
              </p>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {stageTitle}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {headerTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {stageDescription
                ? `${stageDescription} ${headerDescription}`
                : headerDescription}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                  isViewingMorse
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-border/75 bg-background/45 text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setActivePage(ROOM_PAGES.morse)}
              >
                Trang 1 · Game 1
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                  isViewingMemory
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-border/75 bg-background/45 text-muted-foreground",
                  !isMorseComplete &&
                    "cursor-not-allowed border-border/55 text-muted-foreground/55",
                )}
                onClick={() => {
                  if (!isMorseComplete) {
                    return;
                  }

                  setActivePage(ROOM_PAGES.memory);
                }}
                disabled={!isMorseComplete}
              >
                Trang 2 · Game 2
              </button>
            </div>

            <Button
              variant="secondary"
              onClick={handleRestart}
              size="sm"
              type="button"
            >
              <RefreshCw className="size-4" />
              Chơi lại room 2
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Morse đã giải
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {solvedMorseCount}/3
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Cặp đã ghép
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {matchedCount}/6
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Từ khóa gắn đúng
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              {placedKeywordCount}/{STAGE_1945_KEYWORD_TARGETS.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Trạng thái room
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              {roomStatus}
            </p>
          </div>
        </div>
      </article>

      {isViewingMorse && (
        <>
          <article className="rounded-[1.5rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.22)]">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Trang 1 / Game 1
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                Bàn giải mật thư Morse 1945
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Nghe tín hiệu Morse, tự giải mã và thu thập từ khóa để dùng cho
                game lật thẻ ở bước sau.
              </p>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {STAGE_1945_MORSE_PUZZLES.map((puzzle, index) => {
                const puzzleState = getPuzzleState(puzzle, index);
                const feedback = morseFeedback[puzzle.id];

                return (
                  <article
                    key={puzzle.id}
                    className={cn(
                      "rounded-[1.3rem] border p-4 shadow-[0_14px_28px_rgb(0_0_0_/_0.14)]",
                      puzzleState.isSolved
                        ? "border-emerald-300/25 bg-[linear-gradient(145deg,rgba(10,32,28,0.95),rgba(9,18,17,0.98))]"
                        : puzzleState.isReady
                          ? "border-cyan-300/20 bg-[linear-gradient(145deg,rgba(16,26,38,0.95),rgba(11,17,27,0.98))]"
                          : "border-border/75 bg-background/45",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                          {puzzle.label}
                        </p>
                        <h4 className="mt-2 text-xl font-semibold text-foreground">
                          Giải mật tín hiệu
                        </h4>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
                          puzzleState.isSolved
                            ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                            : puzzleState.isReady
                              ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                              : "border border-border/70 bg-background/55 text-muted-foreground",
                        )}
                      >
                        {puzzleState.isSolved ? (
                          <>
                            <CheckCircle2 className="size-4" />
                            Đã giải
                          </>
                        ) : puzzleState.isReady ? (
                          <>
                            <Sparkles className="size-4" />
                            Sẵn sàng
                          </>
                        ) : (
                          <>
                            <LockKeyhole className="size-4" />
                            Đang khóa
                          </>
                        )}
                      </span>
                    </div>

                    <div className="mt-4 rounded-[1rem] border border-border/70 bg-background/55 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                          Phát tín hiệu
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          disabled={
                            !puzzleState.isReady ||
                            playingPuzzleId === puzzle.id
                          }
                          onClick={() =>
                            handlePlaySignal(puzzle.id, puzzle.signal)
                          }
                        >
                          {playingPuzzleId === puzzle.id ? (
                            <Volume2 className="size-4" />
                          ) : (
                            <Play className="size-4" />
                          )}
                          {playingPuzzleId === puzzle.id
                            ? "Đang phát"
                            : "Nghe tín hiệu"}
                        </Button>
                      </div>
                    </div>

                    {!puzzleState.isReady && !puzzleState.isSolved && (
                      <div className="mt-4 rounded-[1rem] border border-dashed border-border/80 bg-background/45 px-4 py-4 text-sm leading-7 text-muted-foreground">
                        {puzzleState.lockReason}
                      </div>
                    )}

                    {puzzleState.isReady && (
                      <form
                        className="mt-4 grid gap-3"
                        onSubmit={(event) =>
                          handleMorseSubmit(event, puzzle, puzzleState)
                        }
                      >
                        <label
                          className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground"
                          htmlFor={puzzle.id}
                        >
                          Nhập cụm từ giải mã
                        </label>
                        <input
                          id={puzzle.id}
                          className="h-11 rounded-xl border border-border bg-background/80 px-3 text-sm text-foreground outline-none transition focus:border-brand disabled:opacity-70"
                          value={morseInputs[puzzle.id]}
                          onChange={(event) =>
                            handleMorseInputChange(
                              puzzle.id,
                              event.target.value,
                            )
                          }
                          autoComplete="off"
                          disabled={puzzleState.isSolved}
                        />
                        <Button type="submit" disabled={puzzleState.isSolved}>
                          Giải mã tín hiệu
                        </Button>
                      </form>
                    )}

                    {feedback && (
                      <div
                        className={cn(
                          "mt-4 rounded-[1rem] border px-4 py-3 text-sm leading-7",
                          feedback.kind === "success"
                            ? "border-emerald-300/25 bg-emerald-400/8 text-emerald-100"
                            : "border-red-300/25 bg-red-400/8 text-red-100",
                        )}
                      >
                        {feedback.message}
                      </div>
                    )}

                    {puzzleState.isSolved && (
                      <div className="mt-4 rounded-[1rem] border border-emerald-300/20 bg-background/38 px-4 py-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-emerald-200">
                          Từ khóa thu được
                        </p>
                        <p className="mt-2 font-mono text-lg font-semibold tracking-[0.08em] text-foreground">
                          {getPuzzleDisplayLabel(puzzle)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {puzzle.revealTags.map((tag) => (
                            <span
                              key={`${puzzle.id}-${tag}`}
                              className="rounded-full border border-emerald-300/20 bg-emerald-400/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-emerald-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Trạng thái Game 1
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {isMorseComplete
                    ? "Đã thu thập đủ từ khóa. Game 2 hiện đã mở."
                    : "Giải đủ 3 mật thư để mở game lật thẻ ở trang sau."}
                </p>
              </div>

              {isMorseComplete ? (
                <Button onClick={() => setActivePage(ROOM_PAGES.memory)}>
                  Sang Game 2
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Chưa mở Game 2
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {collectedKeywordPuzzles.map((puzzle) => (
                <div
                  key={puzzle.id}
                  className="rounded-2xl border border-emerald-300/20 bg-emerald-400/8 px-4 py-3"
                >
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-emerald-200">
                    {puzzle.label}
                  </p>
                  <p className="mt-2 font-mono text-sm font-semibold tracking-[0.08em] text-foreground">
                    {getPuzzleDisplayLabel(puzzle)}
                  </p>
                </div>
              ))}

              {collectedKeywordPuzzles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/75 bg-background/45 px-4 py-3 text-sm leading-7 text-muted-foreground">
                  Chưa có từ khóa nào được thu thập.
                </div>
              )}
            </div>
          </article>
        </>
      )}

      {isViewingMemory && (
        <>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_430px]">
            <article className="rounded-[1.45rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.22)] xl:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Trang 2 / Game 2
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    6 cặp thẻ đang chờ đối chiếu
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Ghép đúng ảnh với thẻ thông tin. Riêng các thẻ có ô khuyết
                    chỉ hoàn tất khi bạn kéo đúng từ khóa từ bảng thu thập vào
                    đúng vị trí.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Số lượt lật
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    {turnCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Sai cặp
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    {failedPairCount}/{maxMemoryMisses}
                  </p>
                </div>
              </div>

              {memoryBoardNotice && (
                <div className="mt-5 rounded-[1rem] border border-red-300/25 bg-red-400/8 px-4 py-4 text-sm leading-7 text-red-100">
                  {memoryBoardNotice}
                </div>
              )}

              <div
                className="mt-5 stage-1945-card-grid"
                aria-busy={isResolving}
              >
                {deck.map((card) => {
                  const milestone = getStage1945Milestone(card.pairId);

                  if (!milestone) {
                    return null;
                  }

                  const isFaceUp = card.status !== "face-down";
                  const isMatched = card.status === "matched";
                  const assignedPuzzle = getAssignedPuzzle(milestone);
                  const isSlotCorrect = isMilestoneKeywordCorrect(milestone);
                  const canAssignKeyword =
                    isMatched &&
                    Boolean(milestone.morsePuzzle) &&
                    Boolean(milestone.infoTextParts);
                  const isSlotHighlighted =
                    canAssignKeyword &&
                    Boolean(selectedKeywordId || draggedKeywordId) &&
                    !assignedPuzzle;

                  return (
                    <div
                      key={card.id}
                      className={cn(
                        "stage-1945-card",
                        isFaceUp && "is-flipped",
                        isMatched && "is-matched",
                        milestone.isFeatured && isFaceUp && "is-featured",
                      )}
                    >
                      <div className="stage-1945-card__inner">
                        <button
                          type="button"
                          className="stage-1945-card__face stage-1945-card__face--back cursor-pointer appearance-none text-left disabled:cursor-default"
                          disabled={card.status !== "face-down" || isResolving}
                          onClick={() => handleCardFlip(card.id)}
                          aria-label={
                            isFaceUp
                              ? `${milestone.title} ${card.cardType}`
                              : "Lật một thẻ mật"
                          }
                        >
                          <span className="stage-1945-card__seal" aria-hidden />
                          <span
                            className="stage-1945-card__crosshair"
                            aria-hidden
                          />
                          <span className="stage-1945-card__label">
                            Hồ sơ 1945
                          </span>
                          <span className="stage-1945-card__subLabel">
                            Lật để xác minh
                          </span>
                        </button>

                        <div
                          className={cn(
                            "stage-1945-card__face stage-1945-card__face--front",
                            card.cardType === "image"
                              ? "stage-1945-card__face--image"
                              : "stage-1945-card__face--info",
                            milestone.isFeatured && "is-featured",
                          )}
                        >
                          {card.cardType === "image" ? (
                            <Stage1945ImageFace milestone={milestone} />
                          ) : (
                            <Stage1945InfoFace
                              milestone={milestone}
                              assignedPuzzle={assignedPuzzle}
                              isSlotCorrect={isSlotCorrect}
                              isSlotInteractive={canAssignKeyword}
                              isSlotHighlighted={isSlotHighlighted}
                              onSlotClick={() =>
                                handleKeywordSlotClick(
                                  milestone.id,
                                  canAssignKeyword,
                                )
                              }
                              onSlotDrop={(event) =>
                                handleKeywordSlotDrop(
                                  event,
                                  milestone.id,
                                  canAssignKeyword,
                                )
                              }
                              onSlotDragOver={(event) =>
                                handleKeywordSlotDragOver(
                                  event,
                                  canAssignKeyword,
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isMemoryPairsComplete && !isKeywordPlacementComplete && (
                <div className="mt-5 rounded-[1.35rem] border border-amber-300/25 bg-[linear-gradient(145deg,rgba(47,33,10,0.95),rgba(28,19,8,0.98))] p-5 shadow-[0_18px_36px_rgb(0_0_0_/_0.2)]">
                  <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-100">
                    <LockKeyhole className="size-4" />
                    Còn thiếu ô khuyết
                  </p>
                  <h4 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                    Đã ghép xong 6 cặp, nhưng hồ sơ chưa hoàn chỉnh
                  </h4>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Hãy dùng bảng từ khóa bên phải để gắn nốt{" "}
                    {STAGE_1945_KEYWORD_TARGETS.length - placedKeywordCount} ô
                    còn thiếu trên các thẻ thông tin đã ghép đúng.
                  </p>
                </div>
              )}

              {isMemoryComplete && (
                <div className="mt-5 rounded-[1.35rem] border border-emerald-300/20 bg-[linear-gradient(145deg,rgba(10,30,31,0.95),rgba(10,18,20,0.98))] p-5 shadow-[0_18px_36px_rgb(0_0_0_/_0.2)]">
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    <CheckCircle2 className="size-4" />
                    Game 2 hoàn tất
                  </p>
                  <h4 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                    Hồ sơ 1945 đã được ráp và điền khuyết hoàn chỉnh
                  </h4>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Cả 6 cặp thẻ và 3 từ khóa đều đã đúng. Xác nhận hoàn tất ải
                    2 để mở sang room 1975.
                  </p>
                </div>
              )}
            </article>

            <aside className="space-y-5">
              <article className="rounded-[1.45rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.2)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Bảng từ khóa
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                      Từ khóa đã thu thập
                    </h3>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/6 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                    {placedKeywordCount}/{STAGE_1945_KEYWORD_TARGETS.length}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Kéo trực tiếp một từ khóa vào ô khuyết trên thẻ thông tin,
                  hoặc chạm để chọn rồi chạm vào ô cần điền.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {collectedKeywordPuzzles.map((puzzle) => {
                    const isAssigned = Object.values(slotAssignments).includes(
                      puzzle.id,
                    );
                    const isSelected = selectedKeywordId === puzzle.id;
                    const isDragging = draggedKeywordId === puzzle.id;

                    return (
                      <button
                        key={puzzle.id}
                        type="button"
                        draggable
                        onClick={() => handleKeywordTokenSelect(puzzle.id)}
                        onDragStart={(event) =>
                          handleKeywordTokenDragStart(event, puzzle.id)
                        }
                        onDragEnd={handleKeywordTokenDragEnd}
                        className={cn(
                          "flex min-w-[10rem] cursor-grab flex-col items-start rounded-[1rem] border px-3 py-3 text-left transition active:cursor-grabbing",
                          isSelected
                            ? "border-cyan-300/35 bg-cyan-300/10"
                            : isAssigned
                              ? "border-emerald-300/25 bg-emerald-400/8"
                              : "border-border/70 bg-background/45 hover:border-cyan-300/25 hover:bg-background/65",
                          isDragging && "opacity-70",
                        )}
                      >
                        <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                          {puzzle.label}
                        </span>
                        <span className="mt-2 font-mono text-sm font-semibold tracking-[0.08em] text-foreground">
                          {getPuzzleDisplayLabel(puzzle)}
                        </span>
                        <span
                          className={cn(
                            "mt-3 text-[0.68rem] uppercase tracking-[0.16em]",
                            isAssigned ? "text-emerald-200" : "text-cyan-200",
                          )}
                        >
                          {isAssigned ? "Đã gắn vào thẻ" : "Sẵn sàng kéo thả"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-[1.45rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.2)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Trạng thái Game 2
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {isMemoryComplete
                    ? "Game 2 đã hoàn tất"
                    : isMemoryPairsComplete
                      ? "Đang chờ điền từ khóa"
                      : "Đang ghép thẻ"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {isMemoryComplete
                    ? "Tất cả cặp thẻ và ô khuyết đều đã đúng."
                    : isMemoryPairsComplete
                      ? "Bạn đã ghép xong cặp thẻ. Hãy gắn nốt các từ khóa đúng vào ô khuyết còn lại."
                      : `Hoàn tất ${STAGE_1945_TOTAL_PAIRS} cặp và điền đúng ${STAGE_1945_KEYWORD_TARGETS.length} từ khóa để khép room 1945.`}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/45 p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Cặp đúng
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {matchedCount}/6
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/45 p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Ô khuyết đúng
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {placedKeywordCount}/{STAGE_1945_KEYWORD_TARGETS.length}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/45 p-4 sm:col-span-2">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Sai cặp còn lại
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {remainingMissCount} lượt trước khi board tự đóng và xáo
                      lại
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.15rem] border border-border/70 bg-background/45 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-cyan-300" />
                    {isMemoryComplete
                      ? "Room 2 đã sẵn sàng mở room 1975"
                      : "Tiếp tục ghép thẻ và điền từ khóa"}
                  </p>
                </div>

                <div className="mt-4">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setActivePage(ROOM_PAGES.morse)}
                  >
                    Quay lại Game 1
                  </Button>
                </div>
              </article>
            </aside>
          </div>

          <article className="rounded-[1.5rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Trạng thái room 1945
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {isRoomTwoComplete
                    ? "Toàn bộ room 2 đã hoàn tất. Xác nhận để chuyển sang room 1975."
                    : "Hoàn tất đủ 6 cặp và điền đúng toàn bộ từ khóa để mở sang room 1975."}
                </p>
              </div>

              {isRoomTwoComplete ? (
                <Button onClick={handleConfirmStageTwoCompletion}>
                  Xác nhận sang room 1975
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Chưa mở room 1975
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </article>
        </>
      )}

      {isRoomTwoComplete && (
        <AdventureStoryOverlay
          theme="parchment"
          badge="Hoàn tất ải 2"
          eyebrow="Biên bản xác nhận"
          title="Hồ sơ 1945 đã được khép lại"
          description="Bạn đã giải đúng toàn bộ mật thư Morse, ghép xong 6 cặp thẻ và điền đủ các từ khóa còn thiếu. Room 2 đã hoàn tất và sẵn sàng mở sang màn 1975."
          progressLabel="2 / 4 room hoàn tất • Room 3 đã mở"
          progressValue={0.5}
          metrics={[
            { label: "Mật thư", value: "3 / 3" },
            { label: "Cặp thẻ", value: "6 / 6" },
            {
              label: "Từ khóa",
              value: `${STAGE_1945_KEYWORD_TARGETS.length} / ${STAGE_1945_KEYWORD_TARGETS.length}`,
            },
          ]}
          actionLabel="Xác nhận và sang màn 1975"
          onAction={handleConfirmStageTwoCompletion}
          actionIcon={ArrowRight}
        />
      )}

      {isViewingMorse && !showMorseHint && (
        <button
          type="button"
          className="fixed bottom-6 right-6 z-[90] inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 shadow-[0_12px_24px_rgb(0_0_0_/_0.35)] transition hover:bg-cyan-300/20"
          onClick={() => setShowMorseHint(true)}
          aria-label="Mở bảng mã Morse"
        >
          <CircleHelp className="size-4" />
          Bảng mã Morse
        </button>
      )}

      {showMorseHint && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Bảng mã Morse"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-border/80 bg-[linear-gradient(145deg,rgba(15,21,31,0.98),rgba(9,13,20,0.98))] p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Hint
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  Bảng mã Morse
                </h3>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowMorseHint(false)}
              >
                <X className="size-4" />
                Đóng
              </Button>
            </div>

            <div className="mt-5 rounded-xl border border-border/65 bg-white p-3">
              <img
                src="/bang_morse.png"
                alt="Bảng mã Morse quốc tế"
                className="mx-auto w-full max-w-[40rem] rounded-md bg-white object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
