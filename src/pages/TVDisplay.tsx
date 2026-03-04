import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveNotices, useActiveAchievements } from '@/hooks/useFirebaseNotices';
import { Sparkles, Trophy, CalendarDays, LayoutGrid, MonitorPlay, RefreshCw } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import rbuLogo from '@/assets/rbu-logo.png';
import { TVNoticePreview } from '@/components/TVNoticePreview';
import { AutoScrollText } from '@/components/AutoScrollText';
import { TVMultiView } from '@/components/TVMultiView';
import { getDailyQuote } from '@/data/spiritualQuotes';
import { categoryConfig } from '@/config/categoryConfig';
import { cn } from '@/lib/utils';
import { useTVDisplaySettings } from '@/hooks/useTVDisplaySettings';

const TVDisplay: React.FC = () => {
  const { notices: activeNotices, loading: noticesLoading } = useActiveNotices();
  const { achievements, loading: achievementsLoading } = useActiveAchievements();
  const { settings } = useTVDisplaySettings();

  // ─── Active display mode (single | multi) ─────────────────────────────────
  // 'single' and 'auto' both begin in single-view; 'multi' begins in multi-view.
  const [activeMode, setActiveMode] = useState<'single' | 'multi'>(
    settings.displayMode === 'multi' ? 'multi' : 'single'
  );

  // Countdown seconds remaining until next auto-switch (only used in 'auto' mode)
  const [autoCountdown, setAutoCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync activeMode ONLY when the user changes displayMode from the Settings page
  // (cross-tab via the storage event). We track the previous value so the effect
  // is a no-op on the first render — preventing it from overwriting the auto-switch
  // timer that starts from the useState initializer above.
  const prevDisplayMode = useRef(settings.displayMode);
  useEffect(() => {
    if (prevDisplayMode.current === settings.displayMode) return;
    prevDisplayMode.current = settings.displayMode;
    // When switching TO auto-mode always restart from single-view
    if (settings.displayMode === 'single') setActiveMode('single');
    else if (settings.displayMode === 'multi') setActiveMode('multi');
    else setActiveMode('single');
  }, [settings.displayMode]);

  // Auto-switch orchestration: fires whenever activeMode or settings change (in auto mode)
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

    // Countdown tick
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

  // Main slide items: non-achievement notices only (achievements live exclusively in the sidebar spotlight)
  const displayItems = useMemo(() => {
    return [...(activeNotices ?? [])]
      .filter(n => n.category !== 'achievements')
      .sort((a, b) => {
        const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
        if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeNotices]);

  // Upcoming events (category === 'events', end in future), up to 4
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (activeNotices ?? [])
      .filter(n => n.category === 'events' && n.endTime && new Date(n.endTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4);
  }, [activeNotices]);

  const current = displayItems[currentIndex];
  // Per-priority durations derived from settings (ms)
  const slideDurations: Record<string, number> = {
    high:   settings.singleHighDuration   * 1000,
    medium: settings.singleMediumDuration * 1000,
    low:    settings.singleNormalDuration * 1000,
  };
  const slideDuration = slideDurations[current?.priority] ?? 12000;

  // Auto-advance slides — only when the single-view is active
  useEffect(() => {
    if (activeMode !== 'single') return;
    if (displayItems.length <= 1) return;
    const t = setTimeout(() => {
      setCurrentIndex(i => (i + 1) % displayItems.length);
      setProgressKey(k => k + 1);
    }, slideDuration);
    return () => clearTimeout(t);
  }, [displayItems, currentIndex, slideDuration, activeMode]);

  // Auto-refresh: if the tab regains visibility after being hidden >10 min
  // (e.g., TV screensaver or power-save mode), reload so Firestore listeners
  // re-establish and fresh notices are fetched — fulfils "persistent display
  // behavior even after TV power off" per the project synopsis.
  useEffect(() => {
    let hiddenAt: number | null = null;
    const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

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

  // Student spotlight cycles through achievements every 20s (independent of main slide)
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  useEffect(() => {
    if (!achievements || achievements.length <= 1) return;
    const t = setInterval(() => setSpotlightIdx(i => (i + 1) % achievements.length), 20000);
    return () => clearInterval(t);
  }, [achievements]);
  const spotlight = achievements && achievements.length > 0 ? achievements[spotlightIdx % achievements.length] : null;

  if (noticesLoading || achievementsLoading) {
    return (
      <div className="h-screen bg-[#060810] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-primary rounded-full animate-spin mb-5 mx-auto" />
          <p className="text-slate-600 font-bold tracking-[0.3em] uppercase text-xs">Updating Board</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#060810] text-white flex flex-col overflow-hidden select-none">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 h-[4.5rem] px-10 flex items-center justify-between border-b border-white/5 z-20 relative">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white/95 p-1 rounded-lg shrink-0">
            <img src={rbuLogo} className="h-full w-full object-contain" alt="RBU" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">Ramdeobaba University</h1>
            <p className="text-[0.65rem] font-bold tracking-[0.35em] text-slate-500 uppercase mt-0.5">
              Nagpur &middot; Digital Notice Board
            </p>
          </div>
        </div>

        {/* Centre: slide dots (single mode only) or mode badge */}
        <div className="flex flex-col items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {activeMode === 'single' && displayItems.length > 1 && (
            <div className="flex items-center gap-1.5">
              {displayItems.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: i === currentIndex ? 20 : 6,
                    height: 6,
                    backgroundColor:
                      i === currentIndex ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>
          )}
          {/* Auto-switch mode indicator */}
          {settings.displayMode === 'auto' && (
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.55rem] font-black uppercase tracking-widest border',
                activeMode === 'single'
                  ? 'text-primary border-primary/30 bg-primary/10'
                  : 'text-purple-400 border-purple-500/30 bg-purple-500/10'
              )}>
                {activeMode === 'single'
                  ? <><MonitorPlay className="h-3 w-3" /> Single View</>
                  : <><LayoutGrid className="h-3 w-3" /> Overview</>
                }
              </div>
              {autoCountdown > 0 && (
                <div className="flex items-center gap-1 text-[0.52rem] font-bold text-slate-600">
                  <RefreshCw className="h-2.5 w-2.5" />
                  {autoCountdown}s
                </div>
              )}
            </div>
          )}
          {/* Manual mode badge (non-auto) */}
          {settings.displayMode !== 'auto' && (
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.52rem] font-black uppercase tracking-widest border',
              settings.displayMode === 'multi'
                ? 'text-purple-400 border-purple-500/20 bg-purple-500/8'
                : 'text-slate-600 border-white/8 bg-white/3'
            )}>
              {settings.displayMode === 'multi'
                ? <><LayoutGrid className="h-2.5 w-2.5" /> Overview Mode</>
                : <><MonitorPlay className="h-2.5 w-2.5" /> Slideshow Mode</>
              }
            </div>
          )}
        </div>

        {/* Clock */}
        <div className="flex items-center gap-5 text-right">
          <div>
            <div className="text-2xl font-bold tabular-nums tracking-tight leading-none">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
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
        {activeMode === 'multi' ? (
          <motion.div
            key="multi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex overflow-hidden min-h-0"
          >
            <TVMultiView
              notices={displayItems}
              achievements={achievements ?? []}
              quoteText={quoteText}
              quoteAuthor={quoteAuthor}
              settings={settings}
            />
          </motion.div>
        ) : (
          <motion.div
            key="single"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex overflow-hidden min-h-0"
          >
            {/* ── Single-view layout ── */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Main slide area */}
              <div className="flex-1 relative overflow-hidden p-6 pr-4 min-w-0">
                {displayItems.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center opacity-30">
                      <Sparkles className="h-14 w-14 mx-auto mb-4" />
                      <p className="font-bold uppercase tracking-[0.4em] text-sm">No active announcements</p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current?.id ?? currentIndex}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                    >
                      <TVNoticePreview notice={current} />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* ── Sidebar ─────────────────────────────────────────────────────── */}
              <aside className="w-96 shrink-0 border-l border-white/5 flex flex-col overflow-hidden">

                {/* Upcoming Events — only shown when there are events */}
                {upcomingEvents.length > 0 && (
                  <>
                    <div className="flex-1 flex flex-col p-5 overflow-hidden min-h-0">
                      <div className="flex items-center gap-2 mb-4 shrink-0">
                        <CalendarDays className="h-3.5 w-3.5 text-purple-400" />
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500">Upcoming Events</p>
                      </div>
                      <div className="space-y-4 overflow-hidden">
                        {upcomingEvents.map((event, i) => {
                          const d = new Date(event.startTime);
                          const tag = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : null;
                          return (
                            <div key={event.id ?? i} className="flex items-center gap-3">
                              {/* Date chip */}
                              <div className="shrink-0 w-10 text-center">
                                {tag ? (
                                  <div className="text-[0.6rem] font-black text-purple-400 uppercase leading-tight">{tag}</div>
                                ) : (
                                  <>
                                    <div className="text-[0.55rem] font-black uppercase text-purple-400 leading-none">{format(d, 'MMM')}</div>
                                    <div className="text-lg font-black text-white leading-none">{format(d, 'd')}</div>
                                  </>
                                )}
                              </div>
                              <div className="w-px h-8 bg-white/8 shrink-0" />
                              <p className="text-[0.78rem] text-white/65 leading-snug line-clamp-2 min-w-0">{event.title}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/5 shrink-0" />
                  </>
                )}

                {/* Student Spotlight — full height when no events, bottom half otherwise */}
                <div className="flex-1 flex flex-col p-5 overflow-hidden min-h-0">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Trophy className={cn("h-3.5 w-3.5 text-yellow-400", upcomingEvents.length === 0 && "h-4 w-4")} />
                    <p className={cn(
                      "font-black uppercase tracking-[0.3em] text-slate-500",
                      upcomingEvents.length === 0 ? "text-[0.65rem]" : "text-[0.6rem]"
                    )}>Student Spotlight</p>
                    {upcomingEvents.length === 0 && (
                      <span className="ml-auto text-[0.5rem] font-black uppercase tracking-widest text-yellow-500/50">Achievements</span>
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
                        className="flex-1 flex flex-col min-h-0 gap-3"
                      >
                        {/* 1. Title — always first */}
                        <p className={cn(
                          "font-black text-white leading-snug shrink-0",
                          upcomingEvents.length === 0 ? "text-xl" : "text-base line-clamp-2"
                        )}>
                          {spotlight.title}
                        </p>

                        {/* 2. Image */}
                        {spotlight.imageUrl && (
                          <div className="w-full rounded-xl overflow-hidden shrink-0 border border-yellow-400/10"
                            style={{ aspectRatio: upcomingEvents.length === 0 ? '4/3' : '16/9' }}>
                            <img
                              src={spotlight.imageUrl}
                              alt={spotlight.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* 3. Description — auto-scrolling markdown */}
                        {spotlight.description && (
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <AutoScrollText
                              content={spotlight.description}
                              className={upcomingEvents.length === 0 ? "text-[0.82rem] text-yellow-100/70" : "text-[0.75rem] text-yellow-100/70"}
                              speed={upcomingEvents.length === 0 ? 22 : 18}
                            />
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="quote"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col justify-center min-h-0"
                      >
                        <p className={cn(
                          "text-slate-400 leading-relaxed italic",
                          upcomingEvents.length === 0 ? "text-[0.9rem]" : "text-[0.78rem]"
                        )}>
                          &ldquo;{quoteText}&rdquo;
                        </p>
                        {quoteAuthor && (
                          <p className="text-[0.65rem] text-slate-600 font-bold mt-2">&mdash; {quoteAuthor}</p>
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
      {activeMode === 'single' && (
        <div className="h-[3px] bg-white/5 shrink-0 relative overflow-hidden">
          <motion.div
            key={`${progressKey}-${currentIndex}`}
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: slideDuration / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {/* ── Auto-switch progress bar (mode-level, shown in auto mode) ────── */}
      {settings.displayMode === 'auto' && (
        <div className="h-[2px] bg-white/5 shrink-0 relative overflow-hidden">
          <motion.div
            key={`auto-${activeMode}`}
            className={cn("absolute inset-y-0 left-0",
              activeMode === 'single' ? 'bg-primary/50' : 'bg-purple-500/50'
            )}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration: activeMode === 'single' ? settings.autoSingleDuration : settings.autoMultiDuration,
              ease: 'linear',
            }}
          />
        </div>
      )}

      {/* ── Ticker ──────────────────────────────────────────────────────── */}
      {displayItems.length > 0 && (
        <footer className="shrink-0 h-9 flex items-center overflow-hidden bg-black/20">
          <div className="shrink-0 h-full px-5 flex items-center bg-primary text-black font-black uppercase tracking-widest text-[0.6rem]">
            Notice Board
          </div>
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              className="flex items-center whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            >
              {[...displayItems, ...displayItems].map((item, i) => {
                const cfg = categoryConfig[item.category] ?? categoryConfig.other;
                return (
                  <span key={i} className="inline-flex items-center gap-2 px-7">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.accent }}
                    />
                    <span className="text-[0.78rem] font-medium text-white/50">{item.title}</span>
                  </span>
                );
              })}
            </motion.div>
          </div>
        </footer>
      )}

    </div>
  );
};

export default TVDisplay;
