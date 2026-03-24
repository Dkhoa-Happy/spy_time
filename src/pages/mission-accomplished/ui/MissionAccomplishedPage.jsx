import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { restartGame } from "../../../app/store/slices/appSlice";
import { ROUTES } from "../../../shared/constants/routes";
import { Button } from "../../../shared/ui/button";

const FIREWORK_BURSTS = [
  {
    id: "left-gold",
    x: "14%",
    y: "20%",
    delay: "0s",
    duration: "3.2s",
    color: "#ffd36b",
    secondary: "#ff7a45",
  },
  {
    id: "top-cyan",
    x: "48%",
    y: "12%",
    delay: "0.9s",
    duration: "3.6s",
    color: "#89e8ff",
    secondary: "#4da8ff",
  },
  {
    id: "right-emerald",
    x: "82%",
    y: "22%",
    delay: "0.45s",
    duration: "3.1s",
    color: "#7df8c7",
    secondary: "#baff8a",
  },
  {
    id: "mid-amber",
    x: "30%",
    y: "44%",
    delay: "1.4s",
    duration: "3.8s",
    color: "#ffc86b",
    secondary: "#ffe29d",
  },
  {
    id: "right-violet",
    x: "71%",
    y: "46%",
    delay: "1.9s",
    duration: "3.4s",
    color: "#d6a8ff",
    secondary: "#8ee8ff",
  },
];

const FIREWORK_SPARKS = Array.from({ length: 12 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 12;
  const distance = index % 2 === 0 ? 74 : 58;

  return {
    id: `spark-${index}`,
    x: `${Math.cos(angle) * distance}px`,
    y: `${Math.sin(angle) * distance}px`,
  };
});

const STAGE_SUMMARY = [
  {
    id: 1,
    year: "1930",
    title: "Mật mã khai mở",
    detail: "Giải đúng cột mốc thành lập, mở khóa chuyên án lịch sử.",
  },
  {
    id: 2,
    year: "1945",
    title: "Phòng tài liệu mật",
    detail: "Xác nhận đúng mốc chuyển biến quyết định của cách mạng.",
  },
  {
    id: 3,
    year: "1975",
    title: "Nông trại phòng tuyến",
    detail:
      "Giữ hậu phương vận hành, nuôi quân qua 10 wave và chặn địch tràn vào nông trại.",
  },
  {
    id: 4,
    year: "1986",
    title: "Đại hội VI và Đổi mới",
    detail:
      "Giải mã thành công hồ sơ chuyển trục và khóa ổn định dòng thời gian.",
  },
];

export const MissionAccomplishedPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectName, game } = useSelector((state) => state.app);
  const keywordBag = game.inventory?.keywords ?? {
    khoiNguon: false,
    docLap: false,
    doiMoi: false,
  };

  if (!game.missionCompleted) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const handleRestart = () => {
    dispatch(restartGame());
    navigate(ROUTES.stage1930);
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[1.7rem] border border-emerald-300/20 bg-[linear-gradient(145deg,rgba(10,26,34,0.96),rgba(8,13,20,0.98))] shadow-[0_30px_70px_rgb(0_0_0_/_0.32)]">
        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="celebration-fireworks" aria-hidden>
            {FIREWORK_BURSTS.map((burst) => (
              <div
                key={burst.id}
                className="celebration-firework"
                style={{
                  "--x": burst.x,
                  "--y": burst.y,
                  "--delay": burst.delay,
                  "--duration": burst.duration,
                  "--firework-color": burst.color,
                  "--firework-secondary": burst.secondary,
                }}
              >
                <span className="celebration-firework__halo" />
                <span className="celebration-firework__core" />
                {FIREWORK_SPARKS.map((spark) => (
                  <span
                    key={`${burst.id}-${spark.id}`}
                    className="celebration-firework__spark"
                    style={{
                      "--tx": spark.x,
                      "--ty": spark.y,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            aria-hidden
          >
            <div className="absolute -top-8 left-0 h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-brand/12 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.45fr_0.9fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-emerald-200">
                <Trophy className="size-4" />
                Mission Accomplished
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Bạn đã giải án thành công toàn bộ 4 ải của {projectName}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Chuỗi manh mối 1930, 1945, 1975 và 1986 đã được nối lại chính
                xác. Hồ sơ lịch sử đã khép kín, mật lệnh cuối được xác thực và
                dòng thời gian hiện ở trạng thái an toàn.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleRestart}>
                  <RefreshCw className="size-4" />
                  Chơi lại từ đầu
                </Button>
                <Button asChild variant="secondary">
                  <Link to={ROUTES.home}>Về trang điều phối</Link>
                </Button>
              </div>
            </div>

            <aside className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-background/40 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Trạng thái chuyên án
                </p>
                <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-emerald-200">
                  <ShieldCheck className="size-5" />
                  Dòng thời gian đã ổn định
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/70 bg-surface/75 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Số ải hoàn tất
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                      {game.completedStages.length}/4
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-surface/75 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Kết quả
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                      PASS
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/40 p-5 backdrop-blur-sm">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-200">
                  <Sparkles className="size-4" />
                  Ghi nhận cuối nhiệm vụ
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Đại hội VI của Đảng, tháng 12/1986, đã được xác minh là cột
                  mốc khởi xướng đường lối đổi mới toàn diện trong hồ sơ mật vụ.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <article className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-[0_16px_35px_rgb(0_0_0_/_0.18)]">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Chỉ thị sau cùng
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Dùng đèn UV soi khắp website
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Đã hoàn thành 3 ải. Từ bây giờ, điệp viên bật chế độ UV Hunt ở góc
          phải màn hình, di chuyển qua các trang và soi lớp nền để tìm chữ ẩn.
          Khi thấy chữ phát sáng, bấm vào để thu hoạch vào túi đồ rồi ghi lại
          trên giấy A4 của quản trò.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/45 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.15em] text-muted-foreground">
              Stage 1 / 1930
            </p>
            <p className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
              {keywordBag.khoiNguon ? "KHỞI NGUỒN / TỔ CHỨC" : "Chưa thu thập"}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/45 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.15em] text-muted-foreground">
              Stage 2 / 1945
            </p>
            <p className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
              {keywordBag.docLap ? "ĐỘC LẬP" : "Chưa thu thập"}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/45 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.15em] text-muted-foreground">
              Stage 3 / 1986
            </p>
            <p className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
              {keywordBag.doiMoi ? "ĐỔI MỚI" : "Chưa thu thập"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            asChild
            variant="secondary"
            disabled={!game.completedStages.includes(1)}
          >
            <Link to={ROUTES.stage1930}>Quay lại room 1930</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            disabled={!game.completedStages.includes(2)}
          >
            <Link to={ROUTES.stage1945}>Quay lại room 1945</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            disabled={!game.completedStages.includes(3)}
          >
            <Link to={ROUTES.stage1986}>Quay lại room 1986</Link>
          </Button>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        {STAGE_SUMMARY.map((stage) => {
          const completed = game.completedStages.includes(stage.id);

          return (
            <article
              key={stage.id}
              className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-[0_16px_35px_rgb(0_0_0_/_0.18)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Stage {stage.id}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {stage.year}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                    completed
                      ? "bg-emerald-400/10 text-emerald-200"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="size-4" />
                  {completed ? "Đã phá giải" : "Chưa xong"}
                </span>
              </div>

              <p className="mt-4 text-lg font-semibold text-foreground">
                {stage.title}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {stage.detail}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};
