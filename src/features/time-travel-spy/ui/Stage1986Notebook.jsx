import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileLock2,
  Flashlight,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { gsap } from "gsap";

import { Button } from "../../../shared/ui/button";

const NOTEBOOK_PAGES = [
  {
    id: 1,
    pageNumber: "01",
    dossierCode: "TS-1986-ALPHA",
    status: "Niêm phong",
    title: "Bìa hồ sơ chuyển trục 1986",
    subtitle: "Nhật ký thu hồi từ kho lưu trữ chiến dịch",
    lead: "Nếu cậu đã mở được tập này, nghĩa là tôi không còn ở kho C-6 nữa. Tôi gom các dấu vết quanh chặng 1975-1986 và mốc Đại hội VI tháng 12/1986 vào đây. Phần chữ hiện ra chỉ để dẫn đường, còn tín hiệu quan trọng nằm dưới lớp mực ẩn.",
    body: [
      "Sau 1975, mọi thứ không đổi hướng ngay lập tức. Tôi lần lại những bản ghi cũ và thấy suốt nhiều năm, Đảng phải vừa sửa cách nghĩ, vừa thử cơ chế, chính sách, vừa dò đường từ thực tế để tìm lối ra cho đất nước.",
      "Đừng đọc lướt. Muốn mở được khóa cuối, cậu phải nhặt đủ mốc đại hội, thời điểm quyết định và cụm từ then chốt mà người đi trước đã giấu rải trong hồ sơ.",
    ],
    facts: [
      "Thu hồi tại: Phòng C-6",
      "Quyền mở: Điệp viên cấp S",
      "Dấu vết chính: Đại hội VI, đường lối đổi mới",
    ],
    summaryTags: ["1975-1986", "Đại hội VI", "Đổi mới toàn diện"],
    footerNote:
      "Vệt bút đỏ ở mép giấy báo đây là hồ sơ bước ngoặt, không phải loại biên bản cất cho đủ thủ tục.",
  },
  {
    id: 2,
    pageNumber: "02",
    dossierCode: "TS-1986-BETA",
    status: "Tiền đề đổi mới",
    title: "Bản ghi giai đoạn khảo nghiệm",
    subtitle: "Trích nhật ký điệp vụ tiền đại hội",
    lead: "Tôi đọc lại các mảnh ghi chép rời từ giai đoạn 1975-1986 và càng chắc một điều: không có cú bẻ lái nào đến trong một đêm. Nó tích lại từ những lần thử, những lần vấp và những bản tổng kết được viết ra sau khi đụng thực tế.",
    body: [
      "Dấu vết chỉ ra rất rõ: đường lối đổi mới không rơi xuống từ khoảng không. Nó được kéo ra từ một quãng dài nhìn thẳng vào chỗ tắc của cơ chế kế hoạch hóa tập trung, kiểu quản lý nặng mệnh lệnh và thói quen bao cấp.",
      "Người viết trước tôi còn gạch đậm một ý: nếu cứ bám vào lối nghĩ chủ quan, nóng vội và giáo điều thì sớm muộn cũng tự khóa mình. Muốn mở đường, phải chịu nhìn vào đời sống thật và tôn trọng quy luật của nó.",
    ],
    facts: [
      "Mốc dò dấu: 1975-1986",
      "Chìa khóa: Thử rồi tổng kết từ thực tế",
      "Nút thắt cũ: Tập trung, bao cấp",
    ],
    summaryTags: ["Khảo nghiệm", "Bao cấp", "Quy luật khách quan"],
    footerNote:
      "Mé trái còn lỗ ghim cũ. Có vẻ từng có một tờ phụ lục liệt kê những lối nghĩ sai bị ai đó rút đi trước khi niêm phong.",
    uvClues: [
      { text: "12/1986", tone: "cyan", position: "top-left" },
      {
        text: "QUY LUẬT KHÁCH QUAN",
        tone: "green",
        position: "center-right",
      },
    ],
  },
  {
    id: 3,
    pageNumber: "03",
    dossierCode: "TS-1986-GAMMA",
    status: "Điểm bẻ lái",
    title: "Điện mật Đại hội VI",
    subtitle: "Bản ghi điệp vụ đã xác thực",
    lead: "Đây là trang tôi đánh dấu bằng mực đậm nhất. Đến Đại hội VI của Đảng, tháng 12/1986, những tín hiệu rời rạc mới chụm lại thành một quyết định rõ ràng: phải đổi mới thật sự, không thể chỉ vá víu từng mảng nữa.",
    body: [
      "Điều được chốt lại không chỉ nằm ở chuyện làm ăn hay điều hành kinh tế. Dấu bút chạy xuyên cả hệ thống chính trị, chính sách xã hội, văn hóa, quốc phòng, an ninh và đối ngoại.",
      "Tôi tin đây là điểm bẻ lái vì nó không sinh ra trên bàn giấy. Nó đi lên từ quá trình tổng kết, tìm tòi, khảo nghiệm thực tiễn, rồi gom lại từ sáng kiến, nguyện vọng và lợi ích của người dân.",
    ],
    facts: [
      "Sự kiện khóa: Đại hội VI của Đảng",
      "Dấu thời gian: 12/1986",
      "Kết luận: Mở ra đường lối đổi mới toàn diện",
    ],
    summaryTags: ["Đại hội VI", "Toàn diện", "Đường lối mới"],
    footerNote:
      "Nét bút xanh sát chân trang là dấu xác nhận cuối. Người để lại hồ sơ muốn nhắc: từ đây cuộc chơi đổi khác hẳn.",
    uvClues: [
      { text: "ĐẠI HỘI VI", tone: "violet", position: "top-center" },
      {
        text: "ĐỔI MỚI TOÀN DIỆN",
        tone: "amber",
        position: "bottom-left",
      },
    ],
  },
  {
    id: 4,
    pageNumber: "04",
    dossierCode: "TS-1986-OMEGA",
    status: "Chuẩn xác nhận",
    title: "Trang xác minh mật lệnh",
    subtitle: "Niêm phong tác vụ của điệp vụ trước",
    objective:
      "Tôi để lại đủ manh mối rồi. Nếu đọc kỹ các trang trước, cậu sẽ ghép được mật lệnh.",
    facts: [
      "Lấy số La Mã của kỳ đại hội quyết định.",
      "Nối tiếp bằng tháng và năm ở thời điểm chốt hướng đi.",
      "Khóa lại bằng chữ cái đầu của cụm từ: Đổi mới toàn diện.",
    ],
    summaryTags: ["Đại hội VI", "12/1986", "Đổi mới toàn diện"],
    footerNote:
      "Có thể nhập có hoặc không có dấu gạch nối. Bỏ dấu cũng được, nhưng ghép thiếu một lớp là khóa vẫn im.",
  },
];

const normalizeClue = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const CLUE_TO_SUMMARY_TAG = {
  [normalizeClue("12/1986")]: "12/1986",
  [normalizeClue("ĐẠI HỘI VI")]: "Đại hội VI",
  [normalizeClue("ĐỔI MỚI TOÀN DIỆN")]: "Đổi mới toàn diện",
};

const NotebookSheet = ({
  page,
  answer,
  onAnswerChange,
  onSubmit,
  revealedSummaryTags,
  interactive,
  isUvEnabled,
  flashlight,
  hiddenMask,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onCollectUvClue,
}) => {
  const hasUvLayer = Boolean(page.uvClues?.length);
  const visibleSummaryTags =
    page.id === 4
      ? page.summaryTags.filter((tag) => revealedSummaryTags.has(tag))
      : page.summaryTags;

  return (
    <article
      className={`spy-dossier-sheet spy-dossier-sheet--page-${page.id}`}
      onMouseEnter={interactive ? onMouseEnter : undefined}
      onMouseLeave={interactive ? onMouseLeave : undefined}
      onMouseMove={interactive ? onMouseMove : undefined}
      onTouchStart={interactive ? onTouchStart : undefined}
      onTouchMove={interactive ? onTouchMove : undefined}
      onTouchEnd={interactive ? onTouchEnd : undefined}
    >
      <div className="spy-dossier-sheet__grain" aria-hidden />
      <div className="spy-dossier-sheet__margin" aria-hidden />
      <div className="spy-dossier-sheet__holes" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div className="spy-dossier-sheet__topline">
        <div>
          <p className="spy-dossier-sheet__code">{page.dossierCode}</p>
          <p className="spy-dossier-sheet__subtitle">{page.subtitle}</p>
        </div>
        <div className="spy-dossier-sheet__meta">
          <span className="spy-dossier-sheet__status">{page.status}</span>
          <span className="spy-dossier-sheet__number">
            Trang {page.pageNumber}
          </span>
        </div>
      </div>

      <header className="spy-dossier-sheet__header">
        <h3 className="spy-dossier-sheet__title">{page.title}</h3>
        <p className="spy-dossier-sheet__lead">{page.lead ?? page.objective}</p>
      </header>

      {page.id !== 4 && (
        <div className="spy-dossier-sheet__content">
          <div className="spy-dossier-sheet__copy">
            {page.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="spy-dossier-sheet__sidebar">
            <div className="spy-dossier-sheet__factCard">
              <p className="spy-dossier-sheet__eyebrow">Tóm tắt nhanh</p>
              <ul className="spy-dossier-sheet__facts">
                {page.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
            <div className="spy-dossier-sheet__tags">
              {page.summaryTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </aside>
        </div>
      )}

      {page.id === 4 && interactive && (
        <form className="spy-dossier-final" onSubmit={onSubmit}>
          <div className="spy-dossier-final__panel">
            <p className="spy-dossier-sheet__eyebrow">Quy tắc ghép mật lệnh</p>
            <ul className="spy-dossier-sheet__facts">
              {page.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>

          <div className="spy-dossier-final__panel">
            <p className="spy-dossier-sheet__eyebrow">Mảnh ghép bắt buộc</p>
            <div className="spy-dossier-sheet__tags spy-dossier-sheet__tags--final">
              {visibleSummaryTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {visibleSummaryTags.length === 0 && (
              <p className="spy-dossier-final__hint">
                Chưa phát hiện mảnh ghép nào. Soi UV ở các trang trước để thu
                thập từ khóa ẩn.
              </p>
            )}
          </div>

          <div className="spy-dossier-final__panel">
            <label
              htmlFor="room-3-password"
              className="spy-dossier-final__label"
            >
              Mật lệnh cuối
            </label>
            <input
              id="room-3-password"
              className="spy-dossier-final__input"
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              placeholder="Ghép mật lệnh từ các manh mối"
              autoComplete="off"
            />
            <p className="spy-dossier-final__hint">{page.footerNote}</p>
          </div>

          <Button type="submit">Xác nhận bước ngoặt 1986</Button>
        </form>
      )}

      {page.id === 4 && !interactive && (
        <div
          className="spy-dossier-final spy-dossier-final--preview"
          aria-hidden
        >
          <div className="spy-dossier-final__panel">
            <p className="spy-dossier-sheet__eyebrow">Quy tắc ghép mật lệnh</p>
            <ul className="spy-dossier-sheet__facts">
              {page.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
          <div className="spy-dossier-final__panel">
            <p className="spy-dossier-sheet__eyebrow">Mảnh ghép bắt buộc</p>
            <div className="spy-dossier-sheet__tags spy-dossier-sheet__tags--final">
              {visibleSummaryTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {visibleSummaryTags.length === 0 && (
              <p className="spy-dossier-final__hint">
                Chưa phát hiện mảnh ghép nào. Soi UV ở các trang trước để thu
                thập từ khóa ẩn.
              </p>
            )}
          </div>
          <div className="spy-dossier-final__panel">
            <p className="spy-dossier-final__label">Mật lệnh cuối</p>
            <div className="spy-dossier-final__input spy-dossier-final__input--ghost">
              VI••••••D•••
            </div>
            <p className="spy-dossier-final__hint">{page.footerNote}</p>
          </div>
        </div>
      )}

      <footer className="spy-dossier-sheet__footer">
        <span>{page.footerNote}</span>
        <span>Mức truy cập: S</span>
      </footer>

      {interactive && hasUvLayer && isUvEnabled && (
        <div
          className="spy-dossier-sheet__uv"
          style={{
            WebkitMaskImage: hiddenMask,
            maskImage: hiddenMask,
          }}
        >
          {page.uvClues.map((clue) => (
            <span
              key={`${page.id}-${clue.text}`}
              className={`notebook-uv-clue notebook-uv-clue--${clue.tone} notebook-uv-clue--${clue.position}`}
              onClick={() => onCollectUvClue?.(clue)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCollectUvClue?.(clue);
                }
              }}
            >
              {clue.text}
            </span>
          ))}
        </div>
      )}

      {interactive && (
        <div
          className={`spy-dossier-flashlight ${
            isUvEnabled
              ? "spy-dossier-flashlight--uv"
              : "spy-dossier-flashlight--normal"
          } ${flashlight.active ? "is-active" : ""}`}
          style={{ left: `${flashlight.x}px`, top: `${flashlight.y}px` }}
        />
      )}
    </article>
  );
};

export const Stage1986Notebook = ({
  answer,
  onAnswerChange,
  onSubmit,
  isUvEnabled,
  onToggleUv,
  flashlight,
  hiddenMask,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [flipState, setFlipState] = useState(null);
  const [revealedSummaryTags, setRevealedSummaryTags] = useState(
    () => new Set(),
  );
  const shellRef = useRef(null);
  const flipSheetRef = useRef(null);
  const pageShadowRef = useRef(null);
  const deskGlowRef = useRef(null);

  const activePage = NOTEBOOK_PAGES[pageIndex];
  const targetPage = flipState ? NOTEBOOK_PAGES[flipState.to] : activePage;

  const revealTagsFromClues = (clues) => {
    if (!Array.isArray(clues) || clues.length === 0) {
      return;
    }

    const discoveredTags = clues
      .map((clue) => CLUE_TO_SUMMARY_TAG[normalizeClue(clue.text)])
      .filter(Boolean);

    if (discoveredTags.length === 0) {
      return;
    }

    setRevealedSummaryTags((previous) => {
      const next = new Set(previous);
      discoveredTags.forEach((tag) => next.add(tag));
      return next;
    });
  };

  const collectUvClue = (clue) => {
    if (!isUvEnabled || !clue) {
      return;
    }

    revealTagsFromClues([clue]);
  };

  const revealByScanning = () => {
    if (!isUvEnabled || !activePage?.uvClues?.length) {
      return;
    }

    revealTagsFromClues(activePage.uvClues);
  };

  const handleMouseMove = (event) => {
    onMouseMove?.(event);
    revealByScanning();
  };

  const handleTouchStart = (event) => {
    onTouchStart?.(event);
    revealByScanning();
  };

  const handleTouchMove = (event) => {
    onTouchMove?.(event);
    revealByScanning();
  };

  const turnPage = (nextDirection) => {
    if (flipState) {
      return;
    }

    const offset = nextDirection === "next" ? 1 : -1;
    const targetIndex = pageIndex + offset;
    if (targetIndex < 0 || targetIndex >= NOTEBOOK_PAGES.length) {
      return;
    }

    const nextFlipState = {
      direction: nextDirection,
      from: pageIndex,
      to: targetIndex,
    };

    setFlipState(nextFlipState);

    window.requestAnimationFrame(() => {
      const flipNode = flipSheetRef.current;
      const shellNode = shellRef.current;
      const pageShadowNode = pageShadowRef.current;
      const deskGlowNode = deskGlowRef.current;

      if (!flipNode || !shellNode || !pageShadowNode || !deskGlowNode) {
        setPageIndex(targetIndex);
        setFlipState(null);
        return;
      }

      const isNext = nextDirection === "next";

      gsap.killTweensOf([flipNode, shellNode, pageShadowNode, deskGlowNode]);
      gsap.set(flipNode, {
        display: "block",
        rotateY: isNext ? 0 : 180,
        transformOrigin: isNext ? "left center" : "right center",
        x: 0,
        y: 0,
        z: 0,
        force3D: true,
      });
      gsap.set(pageShadowNode, { opacity: 0.18, scaleX: 0.94 });
      gsap.set(deskGlowNode, { opacity: 0.24 });

      const timeline = gsap.timeline({
        defaults: {
          duration: 0.82,
          ease: "power2.inOut",
        },
        onComplete: () => {
          setPageIndex(targetIndex);
          setFlipState(null);
          gsap.set([flipNode, shellNode, pageShadowNode, deskGlowNode], {
            clearProps: "all",
          });
        },
      });

      timeline.to(
        shellNode,
        {
          rotateZ: isNext ? -0.25 : 0.25,
          y: -1,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        },
        0,
      );

      timeline.to(
        deskGlowNode,
        {
          opacity: 0.55,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
        },
        0,
      );

      timeline.to(
        pageShadowNode,
        {
          opacity: 0.42,
          scaleX: 1.08,
          duration: 0.38,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
        },
        0,
      );

      timeline.to(
        flipNode,
        {
          rotateY: isNext ? -180 : 0,
          ease: "power1.inOut",
        },
        0,
      );
    });
  };

  const prevDisabled = Boolean(flipState) || pageIndex === 0;
  const nextDisabled =
    Boolean(flipState) || pageIndex === NOTEBOOK_PAGES.length - 1;

  const flipFrontPage = flipState
    ? NOTEBOOK_PAGES[
        flipState.direction === "next" ? flipState.from : flipState.to
      ]
    : activePage;
  const flipBackPage = flipState
    ? NOTEBOOK_PAGES[
        flipState.direction === "next" ? flipState.to : flipState.from
      ]
    : activePage;

  return (
    <div className="spy-dossier">
      <div className="spy-dossier__toolbar">
        <div className="spy-dossier__cluster">
          <span className="spy-dossier__badge">
            <FileLock2 className="size-4" />
            Nhật ký điệp vụ thu hồi
          </span>
          <span className="spy-dossier__badge spy-dossier__badge--muted">
            <ShieldCheck className="size-4" />
            Dấu xác thực của điệp vụ trước
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleUv}
          className={`spy-dossier__uvToggle ${isUvEnabled ? "is-active" : ""}`}
          aria-label={isUvEnabled ? "Tắt đèn UV" : "Bật đèn UV"}
          title={isUvEnabled ? "Tắt đèn UV" : "Bật đèn UV"}
        >
          <Flashlight className="size-4" />
          {isUvEnabled ? "UV đang bật" : "Bật UV"}
        </button>
      </div>

      <div className="spy-dossier__brief">
        <div>
          <p className="spy-dossier__eyebrow">Bàn phân tích 1986</p>
          <p className="spy-dossier__note">
            Ghi chú để lại bởi một điệp vụ tiền nhiệm.
          </p>
        </div>
        <div className="spy-dossier__briefMeta">
          <span>
            <ScanSearch className="size-4" />
            Bật UV và rê đèn để tự động lộ mảnh ghép ẩn
          </span>
          <span>
            <ChevronRight className="size-4" />
            Lật từng trang để ghép cụm khóa
          </span>
        </div>
      </div>

      <div className="spy-dossier__desk">
        <div className="spy-dossier__deskGlow" ref={deskGlowRef} aria-hidden />
        <div className="spy-dossier__shell" ref={shellRef}>
          <div className="spy-dossier__spine" aria-hidden />
          <div
            className="spy-dossier__stack spy-dossier__stack--left"
            aria-hidden
          />
          <div
            className="spy-dossier__stack spy-dossier__stack--right"
            aria-hidden
          />
          <div
            className="spy-dossier__pageShadow"
            ref={pageShadowRef}
            aria-hidden
          />

          <NotebookSheet
            page={targetPage}
            answer={answer}
            onAnswerChange={onAnswerChange}
            onSubmit={onSubmit}
            revealedSummaryTags={revealedSummaryTags}
            interactive={!flipState}
            isUvEnabled={isUvEnabled}
            flashlight={flashlight}
            hiddenMask={hiddenMask}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={onTouchEnd}
            onCollectUvClue={collectUvClue}
          />

          {flipState && (
            <div
              className="spy-dossier-flipSheet"
              ref={flipSheetRef}
              aria-hidden
            >
              <div className="spy-dossier-flipSheet__face spy-dossier-flipSheet__face--front">
                <NotebookSheet
                  page={flipFrontPage}
                  revealedSummaryTags={revealedSummaryTags}
                  interactive={false}
                />
              </div>
              <div className="spy-dossier-flipSheet__face spy-dossier-flipSheet__face--back">
                <NotebookSheet
                  page={flipBackPage}
                  revealedSummaryTags={revealedSummaryTags}
                  interactive={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="spy-dossier__controls">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => turnPage("prev")}
          disabled={prevDisabled}
        >
          <ChevronLeft className="size-4" />
          Trang trước
        </Button>
        <p className="spy-dossier__pager">
          Tờ {pageIndex + 1}/{NOTEBOOK_PAGES.length}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => turnPage("next")}
          disabled={nextDisabled}
        >
          Trang sau
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
