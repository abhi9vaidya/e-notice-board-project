import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveNotices } from '@/hooks/useFirebaseNotices';
import { useArchive } from '@/hooks/useArchive';
import { Sparkles, Trophy, CalendarDays, LayoutGrid, MonitorPlay, RefreshCw, WifiOff } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import rbuLogo from '@/assets/rbu-logo.png';
import { TVNoticePreview } from '@/components/TVNoticePreview';
import { toDisplayImageUrl } from '@/lib/mediaUtils';
import { AutoScrollText } from '@/components/AutoScrollText';
import { TVMultiView } from '@/components/TVMultiView';
import { getDailyQuote } from '@/data/spiritualQuotes';
import { categoryConfig } from '@/config/categoryConfig';
import { cn } from '@/lib/utils';
import { useTVDisplaySettings, type TVDisplayMode } from '@/hooks/useTVDisplaySettings';
import type { Notice } from '@/integrations/firebase/types';

type Slide =
  | { type: 'single'; notice: Notice }
  | { type: 'double'; notices: [Notice, Notice] };

const resolveTVMode = (displayMode: TVDisplayMode, autoStartMode: 'single' | 'multi') => {
  if (displayMode === 'multi') return 'multi';
  if (displayMode === 'auto') return autoStartMode;
  return 'single';
};

/* ────────────────────────────────────────────────────────────────────────────
 * AchievementSpotlightCard
 * Extracted from the existing Student Spotlight sidebar rendering so both
 * the 1-card sidebar view AND the 3-card full-screen view use the EXACT
 * same component — zero UI differences.
 * ──────────────────────────────────────────────────────────────────────────── */
const AchievementSpotlightCard: React.FC<{
  achievement: Notice;
  isLight: boolean;
  titleClassName?: string;
  imageAspectRatio?: string;
  textClassName?: string;
  scrollSpeed?: number;
  className?: string;
}> = ({
  achievement,
  isLight,
  titleClassName,
  imageAspectRatio,
  textClassName,
  scrollSpeed = 22,
  className,
}) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);

    // Reset states when achievement changes
    useEffect(() => {
      setImgError(false);
      setImgLoading(true);
    }, [achievement.id]);

    // Clean up object URLs if they exist (prevent memory leaks from blob URLs)
    useEffect(() => {
      return () => {
        setImgError(false);
        setImgLoading(true);
      };
    }, []);

    return (
      <div className={cn('flex flex-col gap-3 h-full', className)}>
        <p
          className={cn(
            `font-black ${isLight ? 'text-slate-900' : 'text-white'} leading-snug shrink-0`,
            titleClassName
          )}
        >
          {achievement.title}
        </p>

        {/* ── Image container ── */}
        {achievement.imageUrl && !imgError && (
          <div
            className={cn(
              'w-full rounded-xl overflow-hidden shrink-0 border relative',
              isLight ? 'border-yellow-300 bg-yellow-50' : 'border-yellow-400/10 bg-yellow-500/5'
            )}
            style={{ aspectRatio: imageAspectRatio ?? '4/3' }}
          >
            {/* Loading overlay */}
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin opacity-30" />
                  <p className={cn("text-[10px] uppercase tracking-widest font-bold opacity-30",
                    isLight ? 'text-yellow-600' : 'text-yellow-400'
                  )}>
                    Loading
                  </p>
                </div>
              </div>
            )}

            <img
              src={toDisplayImageUrl(achievement.imageUrl)}
              alt={achievement.title}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300 relative z-20",
                imgLoading ? "opacity-0" : "opacity-100"
              )}
              loading="eager"
              onLoad={() => setImgLoading(false)}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== achievement.imageUrl) {
                  img.src = achievement.imageUrl;
                } else {
                  setImgError(true);
                  setImgLoading(false);
                }
              }}
            />
          </div>
        )}

        {/* ── Image: error / unavailable fallback ── */}
        {achievement.imageUrl && imgError && (
          <div
            className={cn(
              'w-full rounded-xl overflow-hidden shrink-0 border flex items-center justify-center',
              isLight
                ? 'border-yellow-300 bg-yellow-50/80'
                : 'border-yellow-400/10 bg-yellow-500/5'
            )}
            style={{ aspectRatio: imageAspectRatio ?? '4/3' }}
          >
            <div className="text-center p-4">
              <Trophy
                className={cn(
                  "h-10 w-10 mx-auto mb-2",
                  isLight ? 'text-yellow-300' : 'text-yellow-500/40'
                )}
              />
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider",
                  isLight ? 'text-yellow-500/70' : 'text-yellow-400/30'
                )}
              >
                Image unavailable
              </p>
            </div>
          </div>
        )}

        {/* ── No image at all — optional trophy icon placeholder ── */}
        {!achievement.imageUrl && (
          <div
            className={cn(
              'w-full rounded-xl overflow-hidden shrink-0 border flex items-center justify-center',
              isLight
                ? 'border-yellow-200 bg-yellow-50/50'
                : 'border-yellow-400/5 bg-yellow-500/[0.02]'
            )}
            style={{ aspectRatio: imageAspectRatio ?? '4/3' }}
          >
            <div className="text-center p-4 opacity-20">
              <Trophy className={cn("h-12 w-12 mx-auto", isLight ? 'text-yellow-500' : 'text-yellow-400')} />
            </div>
          </div>
        )}

        {achievement.description && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <AutoScrollText
              content={achievement.description}
              className={textClassName ?? (isLight ? 'text-yellow-800' : 'text-yellow-100/70')}
              speed={scrollSpeed}
            />
          </div>
        )}
      </div>
    );
  };

const TVDisplay: React.FC = () => {
  const { notices: activeNotices, loading: noticesLoading } = useActiveNotices();
  const { archivedNotices } = useArchive();
  const { settings } = useTVDisplaySettings();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── Active display mode (single | multi) ─────────────────────────────────
  const [activeMode, setActiveMode] = useState<'single' | 'multi'>(
    resolveTVMode(settings.displayMode, settings.autoStartMode)
  );

  // Countdown seconds remaining until next auto-switch (only used in 'auto' mode)
  const [autoCountdown, setAutoCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prevDisplayMode = useRef(settings.displayMode);
  const prevAutoStartMode = useRef(settings.autoStartMode);
  useEffect(() => {
    const displayModeChanged = prevDisplayMode.current !== settings.displayMode;
    const autoStartModeChanged = prevAutoStartMode.current !== settings.autoStartMode;
    prevDisplayMode.current = settings.displayMode;
    prevAutoStartMode.current = settings.autoStartMode;
    if (!displayModeChanged && !autoStartModeChanged) return;
    setActiveMode(resolveTVMode(settings.displayMode, settings.autoStartMode));
  }, [settings.autoStartMode, settings.displayMode]);

  useEffect(() => {
    if (settings.displayMode !== 'auto') {
      setAutoCountdown(0);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    const switchAfterMs =
      activeMode === 'single'
        ? settings.autoSingleDuration * 1000
        : settings.autoMultiDuration * 1000;

    setAutoCountdown(Math.round(switchAfterMs / 1000));
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setAutoCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    const switchTimer = setTimeout(() => {
      setActiveMode(m => (m === 'single' ? 'multi' : 'single'));
    }, switchAfterMs);

    return () => {
      clearTimeout(switchTimer);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [activeMode, settings.displayMode, settings.autoSingleDuration, settings.autoMultiDuration]);

  // ─── Single-view state ─────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progressKey, setProgressKey] = useState(0);

  // Main slide items: non-achievement notices only
  const displayItems = useMemo(() => {
    return [...(activeNotices ?? [])]
      .filter(n => n.category !== 'achievements')
      .sort((a, b) => {
        const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
        if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeNotices]);

  // ─── Archived achievements (archive → achievements only) ───────────────────
  const archivedAchievements = useMemo(() => {
    return (archivedNotices ?? [])
      .filter(n => n.category === 'achievements')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [archivedNotices]);

  // Sidebar spotlight: cycle through archived achievements (1 card at a time)
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  useEffect(() => {
    if (archivedAchievements.length <= 1) return;
    const t = setInterval(() => setSpotlightIdx(i => (i + 1) % archivedAchievements.length), 20000);
    return () => clearInterval(t);
  }, [archivedAchievements]);
  const spotlight =
    archivedAchievements.length > 0 ? archivedAchievements[spotlightIdx % archivedAchievements.length] : null;

  // ─── Full-screen 3-card pagination (when NO active notices) ───────────────
  const CARDS_PER_PAGE = 3;
  const [achPage, setAchPage] = useState(0);
  const achTotalPages = Math.max(1, Math.ceil(archivedAchievements.length / CARDS_PER_PAGE));

  // Reset page when notices reappear (so it starts fresh next time)
  useEffect(() => {
    if (displayItems.length > 0) setAchPage(0);
  }, [displayItems.length]);

  // Auto-loop through achievement pages
  useEffect(() => {
    if (displayItems.length > 0 || achTotalPages <= 1) return;
    const t = setInterval(() => setAchPage(p => (p + 1) % achTotalPages), 12000);
    return () => clearInterval(t);
  }, [displayItems.length, achTotalPages]);

  const currentAchPage = useMemo(() => {
    const start = achPage * CARDS_PER_PAGE;
    return archivedAchievements.slice(start, start + CARDS_PER_PAGE);
  }, [archivedAchievements, achPage]);

  // Group portrait-PDF notices into double slides; everything else is a single slide
  const slides = useMemo<Slide[]>(() => {
    const result: Slide[] = [];
    let i = 0;
    while (i < displayItems.length) {
      const n = displayItems[i];
      if (
        n.pdfOrientation === 'portrait' &&
        i + 1 < displayItems.length &&
        displayItems[i + 1].pdfOrientation === 'portrait'
      ) {
        result.push({ type: 'double', notices: [n, displayItems[i + 1]] });
        i += 2;
      } else {
        result.push({ type: 'single', notice: n });
        i++;
      }
    }
    return result;
  }, [displayItems]);

  // Upcoming events (category === 'events', end in future), up to 4
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (activeNotices ?? [])
      .filter(n => n.category === 'events' && n.endTime && new Date(n.endTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4);
  }, [activeNotices]);

  const currentSlide = slides[currentIndex];
  const slideDurations: Record<string, number> = {
    high: settings.singleHighDuration * 1000,
    medium: settings.singleMediumDuration * 1000,
    low: settings.singleNormalDuration * 1000,
  };
  const slideDuration = (() => {
    if (!currentSlide) return 12000;
    if (currentSlide.type === 'single') return slideDurations[currentSlide.notice.priority] ?? 12000;
    const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const top = currentSlide.notices.reduce((a, b) => (p[a.priority] <= p[b.priority] ? a : b));
    return slideDurations[top.priority] ?? 12000;
  })();

  // Auto-advance slides — only when the single-view is active AND notices exist
  useEffect(() => {
    if (activeMode !== 'single' || displayItems.length === 0) return;
    if (slides.length <= 1) return;
    const t = setTimeout(() => {
      setCurrentIndex(i => (i + 1) % slides.length);
      setProgressKey(k => k + 1);
    }, slideDuration);
    return () => clearTimeout(t);
  }, [slides.length, currentIndex, slideDuration, activeMode, displayItems.length]);

  // Auto-refresh on tab visibility (persistent TV display)
  useEffect(() => {
    let hiddenAt: number | null = null;
    const STALE_THRESHOLD_MS = 10 * 60 * 1000;

    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
      } else {
        if (hiddenAt !== null && Date.now() - hiddenAt > STALE_THRESHOLD_MS) {
          window.location.reload();
        }
        hiddenAt = null;
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [quoteText, quoteAuthor] = useMemo(() => {
    const q = getDailyQuote();
    const dash = q.lastIndexOf(' - ');
    return dash !== -1 ? [q.slice(0, dash), q.slice(dash + 3)] : [q, ''];
  }, []);

  const isLight = settings.tvTheme === 'light';
  const rootBg = isLight ? 'bg-white/72' : 'bg-[#060810]/92';
  const rootText = isLight ? 'text-slate-900' : 'text-white';
  const canvasStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
  };
  const safeAreaStyle: React.CSSProperties = {
    inset: `${settings.tvSafeAreaPercent}%`,
    fontSize: `calc(16px * ${settings.tvUiScalePercent / 100})`,
    position: 'absolute',
  };
  const outerBackgroundStyle: React.CSSProperties = {
    background: isLight
      ? 'radial-gradient(circle at top left, rgba(255,255,255,0.95) 0%, rgba(244,247,252,0.98) 38%, rgba(220,229,241,1) 100%)'
      : 'radial-gradient(circle at top left, rgba(20,30,56,0.95) 0%, rgba(8,12,22,1) 48%, rgba(2,6,15,1) 100%)',
  };
  const frameGlowStyle: React.CSSProperties = {
    background: isLight
      ? 'radial-gradient(circle at 18% 12%, rgba(243,111,39,0.22), transparent 28%), radial-gradient(circle at 88% 10%, rgba(14,116,144,0.18), transparent 24%), radial-gradient(circle at 50% 100%, rgba(251,191,36,0.18), transparent 30%)'
      : 'radial-gradient(circle at 18% 12%, rgba(243,111,39,0.14), transparent 28%), radial-gradient(circle at 82% 10%, rgba(56,189,248,0.14), transparent 22%)',
  };
  const shellClassName = isLight
    ? 'border border-slate-300/70 shadow-[0_30px_80px_rgba(148,163,184,0.28)] backdrop-blur-2xl'
    : 'border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl';
  const headerClassName = isLight
    ? 'border-slate-300/80 bg-white/82 shadow-[0_10px_30px_rgba(148,163,184,0.14)] backdrop-blur-xl'
    : 'border-white/5 bg-black/10';
  const sidebarClassName = isLight
    ? 'border-slate-300/70 bg-white/66 backdrop-blur-xl'
    : 'border-white/5 bg-white/[0.02]';
  const footerClassName = isLight
    ? 'bg-white/82 border-t border-slate-300/80 backdrop-blur-xl'
    : 'bg-black/20';
  const progressTrackClassName = isLight ? 'bg-slate-300/55' : 'bg-white/5';

  // Whether we are in the "no notices → show achievements" branch
  const showingAchievementsFull = displayItems.length === 0;

  if (noticesLoading) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-black">
        <div className="relative h-full w-full" style={outerBackgroundStyle}>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[clamp(18px,1.6vw,36px)] overflow-hidden"
            style={canvasStyle}
          >
            <div className="absolute inset-0" style={frameGlowStyle} />
            <div
              className={`absolute ${rootBg} ${rootText} ${shellClassName} flex items-center justify-center rounded-[clamp(18px,1.4vw,30px)]`}
              style={{ inset: `${settings.tvSafeAreaPercent}%` }}
            >
              <div className="text-center">
                <div className="flex justify-center gap-6 mb-8 opacity-60">
                  <div className="w-56 h-72 rounded-2xl bg-slate-500/20 animate-pulse" />
                  <div className="w-56 h-72 rounded-2xl bg-slate-500/20 animate-pulse delay-75" />
                  <div className="w-56 h-72 rounded-2xl bg-slate-500/20 animate-pulse delay-150" />
                </div>
                <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs">Updating Board</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black select-none">
      <div className="relative h-full w-full" style={outerBackgroundStyle}>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[clamp(18px,1.6vw,36px)] overflow-hidden flex flex-col"
          style={canvasStyle}
        >
          <div className="absolute inset-0" style={frameGlowStyle} />
          <div className="absolute flex flex-col" style={safeAreaStyle}>
            <div className={`h-full w-full ${rootBg} ${rootText} ${shellClassName} flex flex-col overflow-hidden rounded-[clamp(18px,1.4vw,30px)]`}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className={`shrink-0 h-12 sm:h-14 xl:h-[4.5rem] px-3 sm:px-6 xl:px-10 flex items-center justify-between border-b ${headerClassName} z-20 relative`}
      >
        <div className="flex items-center gap-4">
          <div className="h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 bg-white/95 p-0.5 sm:p-1 rounded-lg shrink-0">
            <img src={rbuLogo} className="h-full w-full object-contain" alt="RBU" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base xl:text-xl font-black tracking-tight leading-none">Ramdeobaba University</h1>
            <p className="text-[0.5rem] sm:text-[0.55rem] xl:text-[0.65rem] font-bold tracking-[0.35em] text-slate-500 uppercase mt-0.5">
              Nagpur &middot; Digital Notice Board
            </p>
          </div>
        </div>

        {/* Centre: dots / mode badge / achievement dots */}
        <div className="hidden sm:flex flex-col items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {showingAchievementsFull && archivedAchievements.length > 0 ? (
            /* ── Achievement page indicator (no-notices mode) ── */
            <>
              {achTotalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: achTotalPages }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: i === achPage ? 20 : 6,
                        height: 6,
                        backgroundColor:
                          i === achPage
                            ? '#facc15'
                            : isLight
                              ? 'rgba(0,0,0,0.15)'
                              : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  ))}
                </div>
              )}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.55rem] font-black uppercase tracking-widest border',
                  isLight
                    ? 'text-yellow-700 border-yellow-300 bg-yellow-100'
                    : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                )}
              >
                <Trophy className="h-3 w-3" />
                Student Achievements
              </div>
            </>
          ) : (
            /* ── Existing notice-mode indicators (unchanged) ── */
            <>
              {activeMode === 'single' && slides.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: i === currentIndex ? 20 : 6,
                        height: 6,
                        backgroundColor:
                          i === currentIndex
                            ? 'hsl(var(--primary))'
                            : isLight
                              ? 'rgba(0,0,0,0.15)'
                              : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  ))}
                </div>
              )}
              {settings.displayMode === 'auto' && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.55rem] font-black uppercase tracking-widest border',
                      activeMode === 'single'
                        ? 'text-primary border-primary/30 bg-primary/10'
                        : isLight
                          ? 'text-purple-700 border-purple-300 bg-purple-100'
                          : 'text-purple-400 border-purple-500/30 bg-purple-500/10'
                    )}
                  >
                    {activeMode === 'single' ? (
                      <>
                        <MonitorPlay className="h-3 w-3" /> Single View
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="h-3 w-3" /> Overview
                      </>
                    )}
                  </div>
                  {autoCountdown > 0 && (
                    <div className="flex items-center gap-1 text-[0.52rem] font-bold text-slate-600">
                      <RefreshCw className="h-2.5 w-2.5" />
                      {autoCountdown}s
                    </div>
                  )}
                </div>
              )}
              {settings.displayMode !== 'auto' && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.52rem] font-black uppercase tracking-widest border',
                    settings.displayMode === 'multi'
                      ? 'text-purple-400 border-purple-500/20 bg-purple-500/8'
                      : isLight
                        ? 'text-slate-600 border-slate-300 bg-slate-100'
                        : 'text-slate-400 border-white/8 bg-white/3'
                  )}
                >
                  {settings.displayMode === 'multi' ? (
                    <>
                      <LayoutGrid className="h-2.5 w-2.5" /> Overview Mode
                    </>
                  ) : (
                    <>
                      <MonitorPlay className="h-2.5 w-2.5" /> Slideshow Mode
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Clock */}
        <div className="flex items-center gap-3 sm:gap-4 xl:gap-5 text-right">
          <div>
            <div className="text-base sm:text-lg xl:text-2xl font-bold tabular-nums tracking-tight leading-none">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-[0.5rem] sm:text-[0.55rem] xl:text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {format(currentTime, 'EEEE, MMMM d')}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span className="text-[0.6rem] font-black text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      {/* ── Main content row ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── BRANCH 1: No active notices → full-screen achievement cards ── */}
        {showingAchievementsFull && archivedAchievements.length > 0 ? (
          <motion.div
            key="achievements-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            <div className="flex-1 flex items-center justify-center p-10 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`ach-page-${achPage}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-stretch justify-center gap-6 w-full max-w-7xl h-full"
                >
                  {currentAchPage.map((ach, i) => (
                    <div
                      key={ach.id ?? i}
                      className={cn(
                        'flex-1 max-w-md rounded-2xl overflow-hidden border flex flex-col min-h-0',
                        isLight
                          ? 'bg-white border-yellow-200 shadow-lg p-6'
                          : 'bg-white/[0.03] border-yellow-400/10 p-6'
                      )}
                    >
                      <AchievementSpotlightCard
                        achievement={ach}
                        isLight={isLight}
                        titleClassName="text-xl"
                        imageAspectRatio="16/9"
                        textClassName={`text-[0.82rem] ${isLight ? 'text-yellow-800' : 'text-yellow-100/70'}`}
                        scrollSpeed={22}
                        className="flex-1 min-h-0"
                      />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : showingAchievementsFull && archivedAchievements.length === 0 ? (
          /* ── BRANCH 1b: No notices AND no achievements → fallback ── */
          <motion.div
            key="empty-fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex overflow-hidden min-h-0"
          >
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="text-center opacity-30 max-w-lg">
                <Sparkles className="h-14 w-14 mx-auto mb-4" />
                <p className="font-bold uppercase tracking-[0.4em] text-sm mb-4">No active announcements</p>
                <p className={`text-lg italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  &ldquo;{quoteText}&rdquo;
                </p>
                {quoteAuthor && (
                  <p className={`text-sm mt-2 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                    &mdash; {quoteAuthor}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : activeMode === 'multi' ? (
          /* ── BRANCH 2: Multi-view (unchanged) ── */
          <motion.div
            key="multi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex overflow-hidden min-h-0"
          >
            <TVMultiView
              notices={displayItems.filter(n => n.pdfOrientation !== 'portrait')}
              achievements={archivedAchievements}
              quoteText={quoteText}
              quoteAuthor={quoteAuthor}
              settings={settings}
              isLight={isLight}
            />
          </motion.div>
        ) : (
          /* ── BRANCH 3: Single-view (unchanged except sidebar data source) ── */
          <motion.div
            key="single"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex overflow-hidden min-h-0"
          >
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Main slide area */}
              <div className="flex-1 relative overflow-hidden p-6 pr-4 min-w-0">
                {slides.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center opacity-30">
                      <Sparkles className="h-14 w-14 mx-auto mb-4" />
                      <p className="font-bold uppercase tracking-[0.4em] text-sm">No active announcements</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full relative">
                    {slides.map((slide, i) => (
                      <motion.div
                        key={slide.type === 'single' ? slide.notice.id : `double-${i}`}
                        className="absolute inset-0"
                        animate={{ opacity: i === currentIndex ? 1 : 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{ pointerEvents: i === currentIndex ? 'auto' : 'none' }}
                      >
                        {slide.type === 'double' ? (
                          <div className="h-full flex gap-4">
                            <div className="flex-1 h-full">
                              <TVNoticePreview notice={slide.notices[0]} isLight={isLight} />
                            </div>
                            <div className="flex-1 h-full">
                              <TVNoticePreview notice={slide.notices[1]} isLight={isLight} />
                            </div>
                          </div>
                        ) : (
                          <TVNoticePreview notice={slide.notice} isLight={isLight} />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Sidebar ───────────────────────────────────────────────────── */}
              <aside
                className={`hidden lg:flex w-72 xl:w-96 shrink-0 border-l ${sidebarClassName} flex-col overflow-hidden`}
              >
                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <>
                    <div className="flex-1 flex flex-col p-5 overflow-hidden min-h-0">
                      <div className="flex items-center gap-2 mb-4 shrink-0">
                        <CalendarDays className="h-3.5 w-3.5 text-purple-400" />
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500">
                          Upcoming Events
                        </p>
                      </div>
                      <div className="space-y-4 overflow-hidden">
                        {upcomingEvents.map((event, i) => {
                          const d = new Date(event.startTime);
                          const tag = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : null;
                          return (
                            <div key={event.id ?? i} className="flex items-center gap-3">
                              <div className="shrink-0 w-10 text-center">
                                {tag ? (
                                  <div className="text-[0.6rem] font-black text-purple-400 uppercase leading-tight">
                                    {tag}
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-[0.55rem] font-black uppercase text-purple-400 leading-none">
                                      {format(d, 'MMM')}
                                    </div>
                                    <div
                                      className={`text-lg font-black ${isLight ? 'text-slate-800' : 'text-white'} leading-none`}
                                    >
                                      {format(d, 'd')}
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className={`w-px h-8 ${isLight ? 'bg-slate-200' : 'bg-white/8'} shrink-0`} />
                              <p
                                className={`text-[0.78rem] ${isLight ? 'text-slate-600' : 'text-white/65'} leading-snug line-clamp-2 min-w-0`}
                              >
                                {event.title}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className={`h-px ${isLight ? 'bg-slate-200' : 'bg-white/5'} shrink-0`} />
                  </>
                )}

                {/* Student Spotlight — data from archived achievements */}
                <div className="flex-1 flex flex-col p-5 overflow-hidden min-h-0">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Trophy
                      className={cn('h-3.5 w-3.5 text-yellow-400', upcomingEvents.length === 0 && 'h-4 w-4')}
                    />
                    <p
                      className={cn(
                        'font-black uppercase tracking-[0.3em] text-slate-500',
                        upcomingEvents.length === 0 ? 'text-[0.65rem]' : 'text-[0.6rem]'
                      )}
                    >
                      Student Spotlight
                    </p>
                    {upcomingEvents.length === 0 && (
                      <span className="ml-auto text-[0.5rem] font-black uppercase tracking-widest text-yellow-500/50">
                        Achievements
                      </span>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {spotlight ? (
                      <motion.div
                        key={spotlight.id ?? spotlightIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        <AchievementSpotlightCard
                          achievement={spotlight}
                          isLight={isLight}
                          titleClassName={upcomingEvents.length === 0 ? 'text-xl' : 'text-base line-clamp-2'}
                          imageAspectRatio={upcomingEvents.length === 0 ? '4/3' : '16/9'}
                          textClassName={`${upcomingEvents.length === 0 ? 'text-[0.82rem]' : 'text-[0.75rem]'
                            } ${isLight ? 'text-yellow-800' : 'text-yellow-100/70'}`}
                          scrollSpeed={upcomingEvents.length === 0 ? 22 : 18}
                          className="flex-1 min-h-0"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="quote"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col justify-center min-h-0"
                      >
                        <p
                          className={cn(
                            `${isLight ? 'text-slate-500' : 'text-slate-400'} leading-relaxed italic`,
                            upcomingEvents.length === 0 ? 'text-[0.9rem]' : 'text-[0.78rem]'
                          )}
                        >
                          &ldquo;{quoteText}&rdquo;
                        </p>
                        {quoteAuthor && (
                          <p
                            className={`text-[0.65rem] ${isLight ? 'text-slate-400' : 'text-slate-500'} font-bold mt-2`}
                          >
                            &mdash; {quoteAuthor}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress bar — single-view only (above ticker) ───────────────── */}
      {activeMode === 'single' && !showingAchievementsFull && (
        <div
          className={`h-[3px] ${progressTrackClassName} shrink-0 relative overflow-hidden`}
        >
          <motion.div
            key={`${progressKey}-${currentIndex}`}
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: slideDuration / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {/* ── Achievement auto-loop progress bar (no-notices mode) ────────── */}
      {showingAchievementsFull && archivedAchievements.length > 0 && achTotalPages > 1 && (
        <div
          className={`h-[3px] ${progressTrackClassName} shrink-0 relative overflow-hidden`}
        >
          <motion.div
            key={`ach-prog-${achPage}`}
            className="absolute inset-y-0 left-0 bg-yellow-400"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 12, ease: 'linear' }}
          />
        </div>
      )}

      {/* ── Auto-switch progress bar (mode-level, shown in auto mode) ────── */}
      {settings.displayMode === 'auto' && !showingAchievementsFull && (
        <div
          className={`h-[2px] ${progressTrackClassName} shrink-0 relative overflow-hidden`}
        >
          <motion.div
            key={`auto-${activeMode}`}
            className={cn(
              'absolute inset-y-0 left-0',
              activeMode === 'single' ? 'bg-primary/50' : 'bg-purple-500/50'
            )}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration:
                activeMode === 'single'
                  ? settings.autoSingleDuration
                  : settings.autoMultiDuration,
              ease: 'linear',
            }}
          />
        </div>
      )}

      {/* ── Ticker — Always shows "Thought of the Day" ──────────────────── */}
      <footer
        className={`shrink-0 h-7 sm:h-8 xl:h-9 flex items-center overflow-hidden ${footerClassName}`}
      >
        <div className="shrink-0 h-full px-3 sm:px-4 xl:px-5 flex items-center bg-primary text-white font-black uppercase tracking-widest text-[0.45rem] sm:text-[0.5rem] xl:text-[0.6rem]">
          Thought of the Day
        </div>
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            className="flex items-center whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1].map((dup) => (
              <span key={dup} className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 xl:px-7">
                <span
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: '#facc15' }}
                />
                <span className={`text-[0.65rem] sm:text-[0.7rem] xl:text-[0.78rem] font-medium ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
                  &ldquo;{quoteText}&rdquo;{quoteAuthor ? ` — ${quoteAuthor}` : ''}
                </span>
              </span>
            ))}
          </motion.div>
        </div>
      </footer>

      {/* ── Offline Overlay ── */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full border shadow-2xl bg-black/80 border-red-500/30 backdrop-blur-md"
          >
            <WifiOff className="h-4 w-4 text-red-500" />
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-white text-xs sm:text-sm font-medium tracking-wide">
              Reconnecting to campus network...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVDisplay;
