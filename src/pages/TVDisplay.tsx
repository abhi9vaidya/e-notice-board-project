import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveNotices, useActiveAchievements } from '@/hooks/useFirebaseNotices';
import { Sparkles } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import rbuLogo from '@/assets/rbu-logo.png';
import { TVNoticePreview } from '@/components/TVNoticePreview';
import { getDailyQuote } from '@/data/spiritualQuotes';
import { categoryConfig } from '@/config/categoryConfig';

// Per-priority slide durations (ms)
const DURATIONS: Record<string, number> = {
  high: 18000,
  medium: 13000,
  low: 10000,
};

const TVDisplay: React.FC = () => {
  const { notices: activeNotices, loading: noticesLoading } = useActiveNotices();
  const { achievements, loading: achievementsLoading } = useActiveAchievements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progressKey, setProgressKey] = useState(0);

  // All display items: priority-sorted notices then achievements
  const displayItems = useMemo(() => {
    const notices = [...(activeNotices ?? [])].sort((a, b) => {
      const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
      if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return [...notices, ...(achievements ?? [])];
  }, [activeNotices, achievements]);

  // Upcoming events (category === 'events', end in future), up to 4
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (activeNotices ?? [])
      .filter(n => n.category === 'events' && n.endTime && new Date(n.endTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4);
  }, [activeNotices]);

  const current = displayItems[currentIndex];
  const slideDuration = DURATIONS[current?.priority] ?? 12000;

  // Auto-advance
  useEffect(() => {
    if (displayItems.length <= 1) return;
    const t = setTimeout(() => {
      setCurrentIndex(i => (i + 1) % displayItems.length);
      setProgressKey(k => k + 1);
    }, slideDuration);
    return () => clearTimeout(t);
  }, [displayItems, currentIndex, slideDuration]);

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

  // Next 2 items after current
  const nextItems = useMemo(
    () => displayItems.filter((_, i) => i !== currentIndex).slice(0, 2),
    [displayItems, currentIndex]
  );

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

      {/* Header */}
      <header className="shrink-0 h-[4.5rem] px-10 flex items-center justify-between border-b border-white/5 z-20 relative">
        {/* Left: branding */}
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

        {/* Center: slide progress dots */}
        {displayItems.length > 1 && (
          <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
            {displayItems.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === currentIndex ? 20 : 6,
                  height: 6,
                  backgroundColor:
                    i === currentIndex
                      ? 'hsl(var(--primary))'
                      : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        )}

        {/* Right: clock + live indicator */}
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

      {/* Slide progress bar */}
      <div className="h-px bg-white/5 shrink-0 relative overflow-hidden">
        <motion.div
          key={`${progressKey}-${currentIndex}`}
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: slideDuration / 1000, ease: 'linear' }}
        />
      </div>

      {/* Main content row */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Main slide */}
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

        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-l border-white/5 flex flex-col overflow-hidden">

          {/* Up Next */}
          {nextItems.length > 0 && (
            <div className="p-4 border-b border-white/5 shrink-0">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">
                Up Next
              </p>
              <div className="space-y-3">
                {nextItems.map((item, i) => {
                  const cfg = categoryConfig[item.category] ?? categoryConfig.other;
                  const Icon = cfg.icon;
                  return (
                    <div key={item.id ?? i} className="flex items-start gap-2.5">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: cfg.accent + '28' }}
                      >
                        <Icon className="h-3 w-3" style={{ color: cfg.accent }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.8rem] font-semibold text-white/80 leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-[0.65rem] font-bold mt-0.5" style={{ color: cfg.accent + 'cc' }}>
                          {cfg.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="p-4 border-b border-white/5 flex-1 overflow-hidden">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">
                Upcoming Events
              </p>
              <div className="space-y-3">
                {upcomingEvents.map((event, i) => {
                  const d = new Date(event.startTime);
                  const label = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : null;
                  return (
                    <div key={event.id ?? i} className="flex items-center gap-3">
                      <div className="shrink-0 text-center w-9">
                        {label ? (
                          <div className="text-[0.6rem] font-black text-purple-400 uppercase leading-tight">
                            {label}
                          </div>
                        ) : (
                          <>
                            <div className="text-[0.55rem] font-black uppercase text-purple-400 leading-none">
                              {format(d, 'MMM')}
                            </div>
                            <div className="text-lg font-black text-white leading-none mt-0.5">
                              {format(d, 'd')}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="w-px h-7 bg-white/10 shrink-0" />
                      <p className="text-[0.78rem] text-white/65 leading-snug line-clamp-2 min-w-0">
                        {event.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quote of the Day */}
          <div className="mt-auto p-4 border-t border-white/5 shrink-0">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-600 mb-2.5">
              Quote of the Day
            </p>
            <p className="text-[0.78rem] text-slate-400 leading-relaxed italic">
              &ldquo;{quoteText}&rdquo;
            </p>
            {quoteAuthor && (
              <p className="text-[0.65rem] text-slate-600 font-bold mt-1.5">
                &mdash; {quoteAuthor}
              </p>
            )}
          </div>

        </aside>
      </div>

      {/* Ticker */}
      {displayItems.length > 0 && (
        <footer className="shrink-0 h-9 border-t border-white/5 flex items-center overflow-hidden bg-black/20">
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
