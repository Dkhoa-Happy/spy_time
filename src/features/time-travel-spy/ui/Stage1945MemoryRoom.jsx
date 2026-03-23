import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileImage,
  FileText,
  LockKeyhole,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";

import { completeStage } from "../../../app/store/slices/appSlice";
import { ROUTES } from "../../../shared/constants/routes";
import { cn } from "../../../shared/lib/utils";
import { Button } from "../../../shared/ui/button";
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

const ROOM_PAGES = {
  gameOne: "game-one",
  gameTwo: "game-two",
};

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

const Stage1945ImageFace = ({ milestone }) => {
  return (
    <div className="flex h-full flex-col gap-3 sm:gap-4">
      <div className="flex items-center justify-between gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#76512b] sm:text-[0.64rem] sm:tracking-[0.18em]">
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
        <div className="overflow-hidden rounded-[1rem] border border-[#8d6130]/25 bg-[#e9d2aa]/70">
          <img
            alt={`Tư liệu minh họa ${milestone.title}`}
            className="h-32 w-full object-cover sm:h-40 xl:h-44"
            src={milestone.imageSrc}
          />
        </div>
      ) : (
        <div
          className={`stage-1945-image-placeholder stage-1945-image-placeholder--${milestone.placeholderVariant}`}
        >
          <span className="stage-1945-image-placeholder__grain" />
          <span className="stage-1945-image-placeholder__frame" />
          <span className="stage-1945-image-placeholder__subject" />
          <span className="stage-1945-image-placeholder__stamp" />
        </div>
      )}

      <div className="mt-auto rounded-[0.95rem] border border-[#8a6230]/20 bg-white/35 px-3 py-3">
        <p className="text-[0.58rem] uppercase tracking-[0.18em] text-[#7e5b36] sm:text-[0.64rem] sm:tracking-[0.2em]">
          Khay tư liệu
        </p>
        <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#422810] sm:text-xs sm:tracking-[0.18em]">
          {milestone.imageSlot}
        </p>
      </div>
    </div>
  );
};

const Stage1945InfoFace = ({ milestone }) => {
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
      <p className="mt-3 text-[0.75rem] leading-5 text-[#412a12] sm:text-[0.84rem] sm:leading-6">
        {milestone.infoText}
      </p>

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

export const Stage1945MemoryRoom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(ROOM_PAGES.gameOne);
  const [deck, setDeck] = useState(() => createShuffledStage1945Deck());
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [turnCount, setTurnCount] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [morseInputs, setMorseInputs] = useState(() =>
    Object.fromEntries(STAGE_1945_MORSE_PUZZLES.map((puzzle) => [puzzle.id, ""])),
  );
  const [morseFeedback, setMorseFeedback] = useState({});
  const [solvedMorseIds, setSolvedMorseIds] = useState([]);
  const [playingPuzzleId, setPlayingPuzzleId] = useState("");
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

  const matchedMilestones = STAGE_1945_MILESTONES.filter((milestone) =>
    matchedPairIds.includes(milestone.id),
  );
  const matchedCount = matchedPairIds.length;
  const solvedMorseCount = solvedMorseIds.length;
  const isGameOneComplete = matchedCount === STAGE_1945_TOTAL_PAIRS;
  const isGameTwoComplete = solvedMorseCount === STAGE_1945_MORSE_PUZZLES.length;
  const isRoomTwoComplete = isGameOneComplete && isGameTwoComplete;

  useEffect(() => {
    if (!isRoomTwoComplete || hasCompletedStageRef.current) {
      return;
    }

    dispatch(completeStage(2));
    hasCompletedStageRef.current = true;

    const navigationTimer = window.setTimeout(() => {
      navigate(ROUTES.stage1986);
    }, 900);

    return () => window.clearTimeout(navigationTimer);
  }, [dispatch, isRoomTwoComplete, navigate]);

  const handleRestart = () => {
    if (resolveTimeoutRef.current) {
      window.clearTimeout(resolveTimeoutRef.current);
      resolveTimeoutRef.current = null;
    }

    setActivePage(ROOM_PAGES.gameOne);
    setDeck(createShuffledStage1945Deck());
    setMatchedPairIds([]);
    setTurnCount(0);
    setIsResolving(false);
    setMorseInputs(
      Object.fromEntries(STAGE_1945_MORSE_PUZZLES.map((puzzle) => [puzzle.id, ""])),
    );
    setMorseFeedback({});
    setSolvedMorseIds([]);
    setPlayingPuzzleId("");
  };

  const handleCardFlip = (cardId) => {
    if (isResolving) {
      return;
    }

    const selectedCard = deck.find((card) => card.id === cardId);
    if (!selectedCard || selectedCard.status !== "face-down") {
      return;
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

    setTurnCount((currentCount) => currentCount + 1);
    setIsResolving(true);

    resolveTimeoutRef.current = window.setTimeout(() => {
      setDeck((currentDeck) =>
        currentDeck.map((card) => {
          if (!selectedIds.includes(card.id)) {
            return card;
          }

          return {
            ...card,
            status: isMatch ? "matched" : "face-down",
          };
        }),
      );

      if (isMatch) {
        setMatchedPairIds((currentPairs) =>
          currentPairs.includes(selectedCard.pairId)
            ? currentPairs
            : [...currentPairs, selectedCard.pairId],
        );
      }

      setIsResolving(false);
      resolveTimeoutRef.current = null;
    }, resolveDelayMs);
  };

  const getPuzzleState = (puzzle, index) => {
    const isSolved = solvedMorseIds.includes(puzzle.id);
    const previousPuzzle = index > 0 ? STAGE_1945_MORSE_PUZZLES[index - 1] : null;
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

    const AudioContextCtor =
      window.AudioContext || window.webkitAudioContext;
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

  const roomStatus = isRoomTwoComplete
    ? "Room 3 đã mở"
    : isGameOneComplete
      ? "Sẵn sàng sang Game 2"
      : "Đang ở Game 1";
  const isViewingGameOne = activePage === ROOM_PAGES.gameOne;
  const isViewingGameTwo = activePage === ROOM_PAGES.gameTwo;
  const headerTitle = isViewingGameOne
    ? "Game 1: Lật thẻ cột mốc 1945"
    : "Game 2: Giải mật Morse 1945";
  const headerDescription = isViewingGameOne
    ? "Trang 1 chỉ dành cho game lật thẻ. Hoàn tất đủ 6 cặp rồi mới được chuyển sang trang game Morse."
    : "Trang 2 chỉ mở sau khi game lật thẻ hoàn tất. Giải xong 3 mật thư Morse để mở sang room 1986.";

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-[1.5rem] border border-border/75 bg-[linear-gradient(145deg,rgba(15,21,31,0.98),rgba(9,13,20,0.98))] p-6 shadow-[0_24px_58px_rgb(0_0_0_/_0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-200/6 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-amber-200">
              <Sparkles className="size-4" />
              Room 2 / 1945
            </p>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              {headerTitle}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              {headerDescription}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                  isViewingGameOne
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-border/75 bg-background/45 text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setActivePage(ROOM_PAGES.gameOne)}
              >
                Trang 1 · Game 1
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                  isViewingGameTwo
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "border-border/75 bg-background/45 text-muted-foreground",
                  !isGameOneComplete &&
                    "cursor-not-allowed border-border/55 text-muted-foreground/55",
                )}
                onClick={() => {
                  if (!isGameOneComplete) {
                    return;
                  }

                  setActivePage(ROOM_PAGES.gameTwo);
                }}
                disabled={!isGameOneComplete}
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Đã ghép
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {matchedCount}/6
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Số lượt
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {turnCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Morse đã giải
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              {solvedMorseCount}/3
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

      {isViewingGameOne && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_430px]">
          <article className="rounded-[1.45rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.22)] xl:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Trang 1 / Game 1
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                6 cặp thẻ đang chờ đối chiếu
              </h3>
            </div>

            {!isGameOneComplete && (
              <div className="mt-5 stage-1945-card-grid" aria-busy={isResolving}>
                {deck.map((card) => {
                  const milestone = getStage1945Milestone(card.pairId);

                  if (!milestone) {
                    return null;
                  }

                  const isFaceUp = card.status !== "face-down";
                  const isMatched = card.status === "matched";

                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={cn(
                        "stage-1945-card",
                        isFaceUp && "is-flipped",
                        isMatched && "is-matched",
                        milestone.isFeatured && isFaceUp && "is-featured",
                      )}
                      disabled={card.status !== "face-down" || isResolving}
                      onClick={() => handleCardFlip(card.id)}
                      aria-label={
                        isFaceUp
                          ? `${milestone.title} ${card.cardType}`
                          : "Lật một thẻ mật"
                      }
                    >
                      <div className="stage-1945-card__inner">
                        <div className="stage-1945-card__face stage-1945-card__face--back">
                          <span className="stage-1945-card__seal" aria-hidden />
                          <span className="stage-1945-card__crosshair" aria-hidden />
                          <span className="stage-1945-card__label">
                            Hồ sơ 1945
                          </span>
                          <span className="stage-1945-card__subLabel">
                            Lật để xác minh
                          </span>
                        </div>

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
                            <Stage1945InfoFace milestone={milestone} />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {isGameOneComplete && (
              <div className="mt-5 rounded-[1.35rem] border border-emerald-300/20 bg-[linear-gradient(145deg,rgba(10,30,31,0.95),rgba(10,18,20,0.98))] p-5 shadow-[0_18px_36px_rgb(0_0_0_/_0.2)]">
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  <CheckCircle2 className="size-4" />
                  Game 1 hoàn tất
                </p>
                <h4 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                  Bộ thẻ 1945 đã được ráp hoàn chỉnh
                </h4>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Trang game 1 đã xong. Game 2 được đặt ở trang riêng và chỉ mở
                  khi hoàn tất đủ 6 cặp thẻ.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Kết quả
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      6/6 cặp đúng
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Tổng lượt
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {turnCount} lượt
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Button onClick={() => setActivePage(ROOM_PAGES.gameTwo)}>
                    Sang trang Game 2
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </article>

          <aside className="space-y-5">
            <article className="rounded-[1.45rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.2)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Dòng thời gian 1945
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    Các mốc đã xác minh
                  </h3>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/6 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                  {matchedCount}/6
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Timeline chỉ ghi nhận những cặp đã ghép đúng và luôn sắp lại
                theo đúng trình tự lịch sử.
              </p>

              {matchedMilestones.length === 0 && (
                <div className="mt-5 rounded-[1.2rem] border border-dashed border-border bg-background/45 p-5 text-sm leading-7 text-muted-foreground">
                  Chưa có mốc nào được mở khóa. Hãy hoàn tất trang game 1 để mở
                  dần hồ sơ tháng Tám 1945.
                </div>
              )}

              {matchedMilestones.length > 0 && (
                <div className="mt-5 space-y-3">
                  {matchedMilestones.map((milestone) => (
                    <article
                      key={milestone.id}
                      className={cn(
                        "rounded-[1.15rem] border px-4 py-4",
                        milestone.isFeatured
                          ? "border-amber-300/30 bg-[linear-gradient(145deg,rgba(59,42,8,0.45),rgba(38,24,6,0.28))]"
                          : "border-border/75 bg-background/48",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                            Mốc {milestone.order}
                          </p>
                          <h4 className="mt-1 text-lg font-semibold text-foreground">
                            {milestone.title}
                          </h4>
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em]",
                            milestone.isFeatured
                              ? "border-amber-300/35 bg-amber-200/10 text-amber-100"
                              : "border-border/75 bg-surface/70 text-muted-foreground",
                          )}
                        >
                          {milestone.dateLabel}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {milestone.infoText}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-[1.45rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.2)]">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Trạng thái Room 2
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {isGameOneComplete ? "Trang 2 đã mở" : "Trang 2 đang khóa"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {isGameOneComplete
                  ? "Game 1 đã xong. Bạn có thể chuyển sang trang riêng của game Morse để tiếp tục room 1945."
                  : `Hoàn tất ${STAGE_1945_TOTAL_PAIRS} cặp ở trang này để mở trang Game 2.`}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.15rem] border border-border/70 bg-background/45 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Game 1
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {matchedCount}/6 cặp
                  </p>
                </div>
                <div className="rounded-[1.15rem] border border-border/70 bg-background/45 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Game 2
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {isGameOneComplete ? "Đã mở trang" : "Chưa mở"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[1.15rem] border border-border/70 bg-background/45 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-cyan-300" />
                  {isGameOneComplete
                    ? "Có thể chuyển sang trang Game 2"
                    : "Chưa được vào Game 2"}
                </p>
              </div>
            </article>
          </aside>
        </div>
      )}

      {isViewingGameTwo && (
        <>
          <article className="rounded-[1.5rem] border border-border/75 bg-surface/90 p-5 shadow-[0_22px_48px_rgb(0_0_0_/_0.22)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Trang 2 / Game 2
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  Bàn giải mật thư Morse 1945
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Đây là trang riêng của game 2. Bạn chỉ vào được sau khi hoàn
                  tất game lật thẻ ở trang trước.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Quy ước
                  </p>
                  <p className="mt-2 font-mono text-sm tracking-[0.18em] text-foreground">
                    • = beep ngắn, — = beep dài
                  </p>
                </div>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setActivePage(ROOM_PAGES.gameOne)}
                >
                  Quay lại trang Game 1
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {STAGE_1945_MORSE_PUZZLES.map((puzzle, index) => {
                const puzzleState = getPuzzleState(puzzle, index);
                const feedback = morseFeedback[puzzle.id];
                const visualSignal = puzzle.signal
                  .replaceAll(".", "•")
                  .replaceAll("-", "—");

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

                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {puzzle.clueText}
                    </p>

                    <div className="mt-4 rounded-[1rem] border border-border/70 bg-background/55 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                          Tín hiệu trực quan
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          disabled={
                            !puzzleState.isReady || playingPuzzleId === puzzle.id
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

                      <p className="mt-3 rounded-[0.95rem] border border-border/70 bg-surface/80 px-3 py-3 font-mono text-sm leading-7 text-foreground">
                        {visualSignal}
                      </p>
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
                          placeholder="Ví dụ: QUAN LENH SO MOT"
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
                          Kết quả giải mã
                        </p>
                        <p className="mt-2 font-mono text-lg font-semibold tracking-[0.18em] text-foreground">
                          {puzzle.solvedKeyword}
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
                  Trạng thái room 1945
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {isRoomTwoComplete
                    ? "Toàn bộ room 2 đã hoàn tất. Room 1986 hiện đã mở."
                    : "Hoàn tất cả 3 mật thư ở trang này để mở sang room 1986."}
                </p>
              </div>

              {isRoomTwoComplete ? (
                <Button asChild>
                  <Link to={ROUTES.stage1986}>
                    Tiến tới room 1986
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Chưa mở room 1986
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </article>
        </>
      )}
    </section>
  );
};
