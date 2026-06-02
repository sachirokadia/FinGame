import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Placement = "bottom" | "top" | "right";
type ArrowDir = "down" | "up" | "right";

interface TourStep {
  targetId: string;
  title: string;
  body: string;
  placement: Placement;
  arrowDir: ArrowDir;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-logo",
    title: "Welcome to FinGame 🎮",
    body: "Money meets RPG. Every dollar you track earns XP, builds your streak, and levels up your character. Let's show you around.",
    placement: "bottom",
    arrowDir: "down",
  },
  {
    targetId: "tour-daily-energy",
    title: "Daily Energy 💜",
    body: "Your remaining daily budget lives here. Your AI companion Fin watches it live — go over budget and it triggers a Boss Fight warning.",
    placement: "bottom",
    arrowDir: "down",
  },
  {
    targetId: "tour-add-expense",
    title: "Log a Deed ⚔️",
    body: "Every expense you log earns XP. Tap here to record a spend, pick a category, add a note, and watch your XP bar climb.",
    placement: "top",
    arrowDir: "up",
  },
  {
    targetId: "tour-quest-log",
    title: "Quest Log 📜",
    body: "Active quests give you bonus XP goals to chase. Complete them to unlock badges and climb the leaderboard.",
    placement: "top",
    arrowDir: "up",
  },
  {
    targetId: "tour-nav-quests",
    title: "Quests & Badges 🏆",
    body: "Your full quest list, 200+ collectible badges, level map, and a friends leaderboard all live here.",
    placement: "right",
    arrowDir: "right",
  },
  {
    targetId: "tour-nav-story",
    title: "Your Story 📖",
    body: "Weekly spending intensity chart, total mana spent, top categories, and a full narrative breakdown of your week.",
    placement: "right",
    arrowDir: "right",
  },
  {
    targetId: "tour-nav-stats",
    title: "Stats & Leaderboard 📊",
    body: "Track your Level, XP, streak, and badge count. Compare yourself on the global leaderboard and see your 30-day spending chart.",
    placement: "right",
    arrowDir: "right",
  },
];

const PADDING = 6;
const TOOLTIP_W = 288;

function getTourTarget(targetId: string): HTMLElement | null {
  const byId = document.getElementById(targetId);
  const byData = document.querySelectorAll<HTMLElement>(`[data-tour-id="${targetId}"]`);
  const candidates = [byId, ...Array.from(byData)].filter(Boolean) as HTMLElement[];

  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const style = window.getComputedStyle(el);
      if (style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0) {
        return el;
      }
    }
  }
  return null;
}

function getSpotlightRect(targetId: string) {
  const el = getTourTarget(targetId);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
    bottom: rect.bottom + PADDING,
    right: rect.right + PADDING,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

interface ArrowProps {
  dir: ArrowDir;
  style: React.CSSProperties;
}

const TourArrow: React.FC<ArrowProps> = ({ dir, style }) => {
  const paths: Record<ArrowDir, string> = {
    down: "M4 6 L10 12 L16 6",
    up: "M4 14 L10 8 L16 14",
    right: "M6 4 L12 10 L6 16",
  };

  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      className="fixed z-[58] pointer-events-none"
      style={style}
      aria-hidden
    >
      <path
        d={paths[dir]}
        stroke="#818cf8"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [finalMounted, setFinalMounted] = useState(false);
  const [spotlight, setSpotlight] = useState<ReturnType<typeof getSpotlightRect>>(null);

  const isFinal = currentStep === -1;
  const step = !isFinal ? TOUR_STEPS[currentStep] : null;

  const updateSpotlight = useCallback(() => {
    if (isFinal || !step) {
      setSpotlight(null);
      return;
    }
    setSpotlight(getSpotlightRect(step.targetId));
  }, [currentStep, isFinal, step]);

  const skipMissingStep = useCallback((fromStep: number) => {
    let next = fromStep;
    while (next < TOUR_STEPS.length) {
      const rect = getSpotlightRect(TOUR_STEPS[next].targetId);
      if (rect) {
        setCurrentStep(next);
        return;
      }
      next += 1;
    }
    setCurrentStep(-1);
  }, []);

  useEffect(() => {
    if (isFinal) return;
    const rect = step ? getSpotlightRect(step.targetId) : null;
    if (!rect) {
      skipMissingStep(currentStep + 1);
      return;
    }
    updateSpotlight();
  }, [currentStep, isFinal, step, skipMissingStep, updateSpotlight]);

  useEffect(() => {
    if (isFinal) return;
    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [currentStep, isFinal]);

  useEffect(() => {
    if (!isFinal) {
      setFinalMounted(false);
      return;
    }
    const t = window.setTimeout(() => setFinalMounted(true), 40);
    return () => clearTimeout(t);
  }, [isFinal]);

  useEffect(() => {
    if (isFinal) return;
    const onLayout = () => updateSpotlight();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [isFinal, updateSpotlight]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onComplete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const advance = () => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      setCurrentStep(-1);
      return;
    }
    skipMissingStep(currentStep + 1);
  };

  const getTooltipPosition = () => {
    if (!spotlight || !step) return { top: 80, left: 12 };

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 80;
    let left = spotlight.centerX - TOOLTIP_W / 2;

    if (step.placement === "bottom") {
      top = spotlight.bottom + 14;
    } else if (step.placement === "top") {
      top = spotlight.top - 14 - 160;
    } else if (step.placement === "right") {
      left = spotlight.right + 14;
      top = spotlight.centerY - 80;
    }

    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));
    top = Math.max(12, Math.min(top, vh - 160));

    return { top, left };
  };

  const getArrowPosition = (): React.CSSProperties => {
    if (!spotlight || !step) return { display: "none" };

    if (step.arrowDir === "down") {
      return {
        top: spotlight.bottom + 2,
        left: spotlight.centerX - 10,
      };
    }
    if (step.arrowDir === "up") {
      return {
        top: spotlight.top - 22,
        left: spotlight.centerX - 10,
      };
    }
    return {
      top: spotlight.centerY - 10,
      left: spotlight.right + 2,
    };
  };

  const tooltipPos = getTooltipPosition();

  return createPortal(
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-label="FinGame onboarding tour">
      {!isFinal && spotlight && (
        <div
          className="fixed pointer-events-none z-[56]"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: 16,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.72)",
            border: "2px solid rgba(99, 102, 241, 0.55)",
            filter: "drop-shadow(0 0 12px rgba(99, 102, 241, 0.4))",
            transition: "top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease",
          }}
        />
      )}

      {isFinal && (
        <div className="fixed inset-0 z-[56] bg-black/72 pointer-events-auto" />
      )}

      {!isFinal && step && spotlight && (
        <>
          <TourArrow dir={step.arrowDir} style={getArrowPosition()} />
          <div
            className={`glass-card fixed z-[60] w-72 p-5 flex flex-col gap-3 pointer-events-auto transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Step {currentStep + 1} of 7
            </p>
            <h3 className="font-display font-bold text-base text-on-surface">{step.title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{step.body}</p>

            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentStep ? "bg-primary" : "bg-outline-variant"}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onComplete}
                className="text-xs text-on-surface-variant underline cursor-pointer hover:text-on-surface"
              >
                Skip tour
              </button>
              <button
                type="button"
                onClick={advance}
                className="btn-grad rounded-full px-4 py-2 text-sm text-on-primary font-semibold active:scale-95 transition-transform"
              >
                {currentStep >= TOUR_STEPS.length - 1 ? "Finish ✓" : "Next →"}
              </button>
            </div>
          </div>
        </>
      )}

      {isFinal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-auto">
          <div
            className={`glass-card max-w-sm w-full p-8 flex flex-col items-center text-center gap-4 transition-all duration-200 ease-out ${
              finalMounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <span className="text-4xl text-tertiary" aria-hidden>
              ⚔️
            </span>
            <h2 className="font-display font-bold text-xl text-on-surface">Your Quest Begins Now.</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Log your first expense to earn XP, activate your first quest, and start climbing the leaderboard. The grind
              starts today.
            </p>
            <button
              type="button"
              onClick={onComplete}
              className="btn-grad rounded-full px-8 py-4 text-base text-on-primary font-bold active:scale-95 transition-transform mt-2"
            >
              Start Grinding →
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default OnboardingTour;
