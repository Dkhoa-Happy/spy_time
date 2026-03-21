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
    subtitle: "Kho lưu trữ chiến dịch",
    lead:
      "Hồ sơ này tổng hợp tiến trình tìm đường đổi mới của Đảng trong chặng 1975-1986 và mốc Đại hội VI tháng 12/1986. Phần bề mặt chỉ là báo cáo tóm tắt, các lớp mực ẩn mới giữ lại tín hiệu quyết định.",
    body: [
      "Giáo trình xác định những năm 1975-1986 là giai đoạn Đảng từng bước đổi mới tư duy, đổi mới cơ chế, chính sách và khảo nghiệm thực tiễn để tìm con đường đổi mới đất nước.",
      "Nhiệm vụ của điệp viên: soi rõ các manh mối ẩn, xác định mốc Đại hội VI, rồi ghép mật lệnh cuối theo quy tắc ở trang xác minh.",
    ],
    facts: [
      "Lưu trữ: Phòng C-6",
      "Truy cập: Điệp viên cấp S",
      "Trọng tâm: Đại hội VI và đường lối đổi mới",
    ],
    summaryTags: ["1975-1986", "Đại hội VI", "Đổi mới toàn diện"],
    footerNote:
      "Bút đỏ ở mép giấy đánh dấu đây là hồ sơ chuyển trục, không phải báo cáo sự vụ thông thường.",
  },
  {
    id: 2,
    pageNumber: "02",
    dossierCode: "TS-1986-BETA",
    status: "Tiền đề đổi mới",
    title: "Bản ghi giai đoạn khảo nghiệm",
    subtitle: "Tư liệu tiền đại hội",
    lead:
      "Theo giáo trình, giai đoạn 1975-1986 là quá trình từng bước đổi mới tư duy, đổi mới cơ chế, chính sách và khảo nghiệm thực tiễn để tìm con đường đổi mới đất nước.",
    body: [
      "Đường lối đổi mới không xuất hiện đột ngột. Nó hình thành sau một chặng dài tổng kết thực tiễn, nhận diện những giới hạn của cơ chế kế hoạch hóa tập trung, quản lý hành chính và bao cấp.",
      "Từ các khảo nghiệm đó, hồ sơ nhấn mạnh phải khắc phục lối tư duy chủ quan, duy ý chí, giáo điều, nóng vội và chuyển sang tôn trọng quy luật khách quan của đời sống kinh tế - xã hội.",
    ],
    facts: [
      "Mốc nền: 1975-1986",
      "Khâu quyết định: Khảo nghiệm thực tiễn",
      "Lối cũ cần vượt qua: Tập trung, bao cấp",
    ],
    summaryTags: ["Khảo nghiệm", "Bao cấp", "Quy luật khách quan"],
    footerNote:
      "Mé trái trang còn vết ghim cũ, cho thấy từng có phụ lục tổng kết sai lầm tư duy bị rút khỏi hồ sơ.",
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
    subtitle: "Bản ghi tổng hợp",
    lead:
      "Giáo trình xác định rõ: tại Đại hội VI của Đảng, tháng 12/1986, đường lối đổi mới được hoạch định toàn diện chứ không chỉ sửa kỹ thuật ở một lĩnh vực đơn lẻ.",
    body: [
      "Báo cáo lưu ý phạm vi đổi mới trải trên cả cơ chế, chính sách kinh tế, hệ thống chính trị, chính sách xã hội, văn hóa, quốc phòng, an ninh và đối ngoại.",
      "Đây cũng là kết quả của quá trình tổng kết, tìm tòi, khảo nghiệm thực tiễn và dựa trên sáng kiến, nguyện vọng, lợi ích của các tầng lớp nhân dân.",
    ],
    facts: [
      "Sự kiện: Đại hội VI của Đảng",
      "Thời điểm: 12/1986",
      "Ý nghĩa: Khởi xướng đường lối đổi mới toàn diện",
    ],
    summaryTags: ["Đại hội VI", "Toàn diện", "Đường lối mới"],
    footerNote:
      "Nét bút xanh dưới chân trang là ký hiệu xác nhận: đây là cột mốc mở đầu công cuộc đổi mới.",
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
    subtitle: "Niêm phong tác vụ",
    objective:
      "Từ các manh mối đã soi được, hãy ghép mật lệnh theo đúng cấu trúc suy luận thay vì nhập nguyên một cụm lịch sử có sẵn.",
    facts: [
      "Lấy số La Mã của đại hội then chốt.",
      "Nối tiếp bằng tháng và năm hoạch định đường lối.",
      "Kết bằng chữ cái đầu của cụm từ then chốt: Đổi mới toàn diện.",
    ],
    summaryTags: ["Đại hội VI", "12/1986", "Đổi mới toàn diện"],
    footerNote:
      "Bỏ dấu, bỏ ký tự ngăn cách nếu muốn. Chỉ khi ghép đủ ba lớp manh mối thì hồ sơ mới mở khóa.",
  },
];

const NotebookSheet = ({
  page,
  answer,
  onAnswerChange,
  onSubmit,
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
}) => {
  const hasUvLayer = Boolean(page.uvClues?.length);

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
          <span className="spy-dossier-sheet__number">Trang {page.pageNumber}</span>
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
              {page.summaryTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="spy-dossier-final__panel">
            <label htmlFor="room-3-password" className="spy-dossier-final__label">
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
        <div className="spy-dossier-final spy-dossier-final--preview" aria-hidden>
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
              {page.summaryTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
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
  const shellRef = useRef(null);
  const flipSheetRef = useRef(null);
  const pageShadowRef = useRef(null);
  const deskGlowRef = useRef(null);

  const activePage = NOTEBOOK_PAGES[pageIndex];
  const targetPage = flipState ? NOTEBOOK_PAGES[flipState.to] : activePage;

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
    ? NOTEBOOK_PAGES[flipState.direction === "next" ? flipState.from : flipState.to]
    : activePage;
  const flipBackPage = flipState
    ? NOTEBOOK_PAGES[flipState.direction === "next" ? flipState.to : flipState.from]
    : activePage;

  return (
    <div className="spy-dossier">
      <div className="spy-dossier__toolbar">
        <div className="spy-dossier__cluster">
          <span className="spy-dossier__badge">
            <FileLock2 className="size-4" />
            Hồ sơ tối mật
          </span>
          <span className="spy-dossier__badge spy-dossier__badge--muted">
            <ShieldCheck className="size-4" />
            Xác thực trực tiếp tại bàn
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleUv}
          className={`spy-dossier__uvToggle ${
            isUvEnabled ? "is-active" : ""
          }`}
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
          <h3 className="spy-dossier__heading">Notebook puzzle đã được dựng lại như một hồ sơ mật thật</h3>
        </div>
        <div className="spy-dossier__briefMeta">
          <span>
            <ScanSearch className="size-4" />
            Rê đèn UV để soi mực ẩn
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
          <div className="spy-dossier__stack spy-dossier__stack--left" aria-hidden />
          <div className="spy-dossier__stack spy-dossier__stack--right" aria-hidden />
          <div className="spy-dossier__pageShadow" ref={pageShadowRef} aria-hidden />

          <NotebookSheet
            page={targetPage}
            answer={answer}
            onAnswerChange={onAnswerChange}
            onSubmit={onSubmit}
            interactive={!flipState}
            isUvEnabled={isUvEnabled}
            flashlight={flashlight}
            hiddenMask={hiddenMask}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />

          {flipState && (
            <div
              className="spy-dossier-flipSheet"
              ref={flipSheetRef}
              aria-hidden
            >
              <div className="spy-dossier-flipSheet__face spy-dossier-flipSheet__face--front">
                <NotebookSheet page={flipFrontPage} interactive={false} />
              </div>
              <div className="spy-dossier-flipSheet__face spy-dossier-flipSheet__face--back">
                <NotebookSheet page={flipBackPage} interactive={false} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="spy-dossier__controls">
        <Button variant="secondary" size="sm" onClick={() => turnPage("prev")} disabled={prevDisabled}>
          <ChevronLeft className="size-4" />
          Trang trước
        </Button>
        <p className="spy-dossier__pager">
          Tờ {pageIndex + 1}/{NOTEBOOK_PAGES.length}
        </p>
        <Button variant="secondary" size="sm" onClick={() => turnPage("next")} disabled={nextDisabled}>
          Trang sau
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
