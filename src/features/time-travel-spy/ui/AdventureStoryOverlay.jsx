import { cn } from "../../../shared/lib/utils";
import { STAGE_STORY_UI_ASSETS } from "../lib/stage1975AssetManifest";

const PIXEL_ART_STYLE = {
  imageRendering: "pixelated",
};

const getProgressWidth = (value) => `${Math.max(0, Math.min(1, value)) * 100}%`;

const AdventureStoryButton = ({
  label,
  onClick,
  disabled = false,
  icon: Icon,
  asset,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex min-h-14 min-w-[15rem] items-center justify-center gap-2 px-6 pb-2 pt-1.5 text-center text-sm font-black uppercase tracking-[0.16em] text-[#2d1b0a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:brightness-75 disabled:opacity-70",
      disabled && "pointer-events-none",
    )}
    style={{
      ...PIXEL_ART_STYLE,
      backgroundImage: `url(${asset})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "100% 100%",
      textShadow: "0 1px 0 rgba(255,255,255,0.28)",
    }}
  >
    <span>{label}</span>
    {Icon && <Icon className="size-4" />}
  </button>
);

export const AdventureStoryOverlay = ({
  theme = "parchment",
  badge,
  eyebrow,
  title,
  description,
  progressLabel,
  progressValue = 0,
  metrics = [],
  actionLabel,
  onAction,
  actionIcon,
  secondaryLabel,
  onSecondaryAction,
  secondaryIcon,
  secondaryDisabled = false,
}) => {
  const uiTheme = STAGE_STORY_UI_ASSETS[theme] ?? STAGE_STORY_UI_ASSETS.parchment;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/64 px-4 backdrop-blur-sm">
      <article
        className={cn(
          "relative w-full max-w-3xl overflow-hidden rounded-[2rem] border px-5 py-8 shadow-[0_34px_70px_rgb(0_0_0_/_0.42)] sm:px-8",
          uiTheme.shellClassName,
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-3 rounded-[1.5rem]",
            uiTheme.innerPanelClassName,
          )}
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-3 rounded-[1.5rem]",
            uiTheme.patternOpacityClassName,
          )}
          style={{
            ...PIXEL_ART_STYLE,
            backgroundImage: `url(${uiTheme.pattern})`,
            backgroundRepeat: "repeat",
            backgroundSize: "36px 36px",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-8 h-24 rounded-[1.6rem] opacity-75"
          style={{
            ...PIXEL_ART_STYLE,
            backgroundImage: `url(${uiTheme.panel})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "100% 100%",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-[1.5rem] opacity-55"
          style={{
            ...PIXEL_ART_STYLE,
            backgroundImage: `url(${uiTheme.border}), url(${uiTheme.border})`,
            backgroundRepeat: "repeat-x, repeat-x",
            backgroundPosition: "top center, bottom center",
            backgroundSize: "64px 14px, 64px 14px",
          }}
        />

        <img
          src={uiTheme.banner}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-4 h-14 -translate-x-1/2 object-contain sm:h-16"
          style={PIXEL_ART_STYLE}
        />

        <div className="relative pt-16">
          {badge && (
            <span
              className={cn(
                "mx-auto inline-flex rounded-full border px-4 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em]",
                uiTheme.badgeClassName,
              )}
            >
              {badge}
            </span>
          )}

          {eyebrow && (
            <p
              className={cn(
                "mt-4 text-[0.74rem] uppercase tracking-[0.28em]",
                uiTheme.eyebrowClassName,
              )}
            >
              {eyebrow}
            </p>
          )}

          <h3
            className={cn(
              "mt-4 text-3xl font-black tracking-tight sm:text-[2.35rem]",
              uiTheme.headlineClassName,
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 sm:text-[0.96rem]",
              uiTheme.bodyClassName,
            )}
          >
            {description}
          </p>

          {progressLabel && (
            <div className="mt-6 max-w-xl">
              <div className="flex items-center justify-between gap-4">
                <p
                  className={cn(
                    "text-[0.68rem] font-black uppercase tracking-[0.18em]",
                    uiTheme.eyebrowClassName,
                  )}
                >
                  Tiến độ chiến dịch
                </p>
                <p
                  className={cn(
                    "text-[0.72rem] font-bold uppercase tracking-[0.18em]",
                    uiTheme.eyebrowClassName,
                  )}
                >
                  {progressLabel}
                </p>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-black/25 bg-black/18 p-1">
                <div
                  className="h-4 rounded-md"
                  style={{
                    ...PIXEL_ART_STYLE,
                    width: getProgressWidth(progressValue),
                    backgroundImage: `url(${uiTheme.progressFill}), url(${uiTheme.progressBorder})`,
                    backgroundRepeat: "repeat-x, repeat-x",
                    backgroundSize: "16px 100%, 16px 100%",
                    backgroundPosition: "left center, left center",
                  }}
                />
              </div>
            </div>
          )}

          {metrics.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.4rem] border border-white/10 bg-black/12 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  style={{
                    ...PIXEL_ART_STYLE,
                    backgroundImage: `linear-gradient(180deg,rgba(255,255,255,0.07),rgba(0,0,0,0.12)), url(${uiTheme.metric})`,
                    backgroundRepeat: "no-repeat, no-repeat",
                    backgroundPosition: "center, right 14px bottom 12px",
                    backgroundSize: "auto, 72px 72px",
                  }}
                >
                  <p
                    className={cn(
                      "text-[0.68rem] font-black uppercase tracking-[0.16em]",
                      uiTheme.eyebrowClassName,
                    )}
                  >
                    {metric.label}
                  </p>
                  <strong
                    className={cn(
                      "mt-2 block text-2xl font-black",
                      uiTheme.headlineClassName,
                    )}
                  >
                    {metric.value}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-end gap-3">
            {secondaryLabel && (
              <AdventureStoryButton
                label={secondaryLabel}
                onClick={onSecondaryAction}
                disabled={secondaryDisabled}
                icon={secondaryIcon}
                asset={STAGE_STORY_UI_ASSETS.alert.button}
              />
            )}

            {actionLabel && (
              <AdventureStoryButton
                label={actionLabel}
                onClick={onAction}
                icon={actionIcon}
                asset={uiTheme.button}
              />
            )}
          </div>
        </div>
      </article>
    </div>
  );
};
