/**
 * TVMultiView — the "overview" layout for the TV notice board.
 *
 * Layout (full-screen):
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ Header (logo · live indicator · clock)                                   │
 * ├────────────────────────────────────────┬─────────────────────────────────┤
 * │  ● HIGH PRIORITY                       │  🔔 CELEBRATIONS (n/total)      │
 * │   ┌──────────────────────────────────┐ │  ┌─────────────────────────────┐│
 * │   │  TVNoticePreview (scaled)        │ │  │  Achievement spotlight      ││
 * │   │  cycles through high-priority    │ │  │  (photo · name · title)     ││
 * │   └──────────────────────────────────┘ │  └─────────────────────────────┘│
 * ├────────────────────────────────────────┤                                  │
 * │  ● NOTICES (page/total)               │                                  │
 * │   ┌──────────┐ ┌──────────┐ ...       │                                  │
 * │   │ compact  │ │ compact  │           │                                  │
 * │   │ card     │ │ card     │           │                                  │
 * │   └──────────┘ └──────────┘           │                                  │
 * ├────────────────────────────────────────┴─────────────────────────────────┤
 * │ Ticker / Thought of the Day                                              │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, User } from 'lucide-react';
import { format } from 'date-fns';
import { TVNoticePreview } from '@/components/TVNoticePreview';
import { AutoScrollText } from '@/components/AutoScrollText';
import { categoryConfig } from '@/config/categoryConfig';
import { cn } from '@/lib/utils';
import type { TVDisplaySettings } from '@/hooks/useTVDisplaySettings';
import type { Notice } from '@/integrations/firebase/types';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TVMultiViewProps {
  /** All non-achievement active notices */
  notices: Notice[];
  /** Achievement / celebration notices (for the sidebar spotlight) */
  achievements: Notice[];
  /** Quote text to show in the ticker */
  quoteText: string;
  quoteAuthor: string;
  /** Settings controlling durations */
  settings: TVDisplaySettings;
}

// ── Compact notice card (used in the NOTICES grid) ────────────────────────────

interface CompactCardProps {
  notice: Notice;
}

const CompactCard: React.FC<CompactCardProps> = ({ notice }) => {
  const cfg = categoryConfig[notice.category] ?? categoryConfig.other;
  const Icon = cfg.icon;
  const priorityColor =
    notice.priority === 'high'
      ? 'text-red-400 border-red-500/40'
      : notice.priority === 'medium'
      ? 'text-amber-400 border-amber-500/40'
      : 'text-slate-400 border-white/10';

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden p-4 gap-2.5">
      {/* Top row: priority badge + date */}
      <div className="flex items-center justify-between shrink-0">
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.58rem] font-black uppercase tracking-widest',
            priorityColor,
            notice.priority === 'high' ? 'bg-red-500/10' : notice.priority === 'medium' ? 'bg-amber-500/10' : 'bg-white/5'
          )}
        >
          {notice.priority === 'high' && <Zap className="h-2.5 w-2.5 fill-current" />}
          <Icon className="h-2.5 w-2.5" />
          {notice.customCategory ?? cfg.label}
        </div>
        <span className="text-[0.6rem] text-slate-500 font-medium tabular-nums shrink-0">
          {format(new Date(notice.createdAt), 'dd MMM')}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[0.9rem] font-black text-white leading-snug line-clamp-2 shrink-0">
        {notice.title}
      </h3>

      {/* Image or description */}
      {notice.imageUrl ? (
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/8">
          <img src={notice.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : notice.description ? (
        <p className="flex-1 text-[0.72rem] text-slate-400 leading-relaxed line-clamp-4 min-h-0">
          {notice.description.replace(/[#*`_~>[\]]/g, '').trim()}
        </p>
      ) : null}

      {/* Footer: faculty */}
      <div className="flex items-center gap-1.5 shrink-0 mt-auto pt-1 border-t border-white/5">
        <User className="h-3 w-3 text-slate-600" />
        <span className="text-[0.6rem] text-slate-600 font-medium truncate">{notice.facultyName}</span>
      </div>
    </div>
  );
};

// ── Achievement Spotlight (sidebar) ──────────────────────────────────────────

interface SpotlightProps {
  achievement: Notice | null;
  quoteText: string;
  quoteAuthor: string;
  totalCount: number;
  currentIdx: number;
}

const Spotlight: React.FC<SpotlightProps> = ({ achievement, quoteText, quoteAuthor, totalCount, currentIdx }) => (
  <AnimatePresence mode="wait">
    {achievement ? (
      <motion.div
        key={achievement.id ?? currentIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col min-h-0 gap-3"
      >
        {/* 1. Title — always first */}
        <p className="text-xl font-black text-white leading-snug shrink-0">
          {achievement.title}
        </p>

        {/* 2. Image — full-width rectangular, matching the single-view sidebar */}
        {achievement.imageUrl && (
          <div
            className="w-full rounded-xl overflow-hidden shrink-0 border border-yellow-400/10"
            style={{ aspectRatio: '4/3' }}
          >
            <img
              src={achievement.imageUrl}
              alt={achievement.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 3. Description — auto-scrolling */}
        {achievement.description && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <AutoScrollText
              content={achievement.description}
              className="text-[0.82rem] text-yellow-100/70"
              speed={22}
            />
          </div>
        )}

        {/* Page dots */}
        {totalCount > 1 && (
          <div className="flex justify-center gap-1 shrink-0">
            {Array.from({ length: totalCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === currentIdx % totalCount ? 14 : 5,
                  height: 5,
                  backgroundColor: i === currentIdx % totalCount ? '#facc15' : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    ) : (
      <motion.div
        key="no-achievement"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col justify-center items-center min-h-0 text-center"
      >
        <Trophy className="h-12 w-12 text-yellow-400/20 mb-4" />
        <p className="text-[0.78rem] text-slate-400 leading-relaxed italic">&ldquo;{quoteText}&rdquo;</p>
        {quoteAuthor && (
          <p className="text-[0.62rem] text-slate-600 font-bold mt-2">&mdash; {quoteAuthor}</p>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Main component ────────────────────────────────────────────────────────────

export const TVMultiView: React.FC<TVMultiViewProps> = ({
  notices,
  achievements,
  quoteText,
  quoteAuthor,
  settings,
}) => {
  const perPage = settings.multiNoticesPerRow;

  // ─ High-priority notices (shown 1 at a time in the hero panel) ──────────
  const highNotices = useMemo(
    () => notices.filter(n => n.priority === 'high'),
    [notices]
  );
  const otherNotices = useMemo(
    () => notices.filter(n => n.priority !== 'high'),
    [notices]
  );

  const [highIdx, setHighIdx] = useState(0);
  const [noticePageIdx, setNoticePageIdx] = useState(0);
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  // Cycle high-priority hero notice
  useEffect(() => {
    if (highNotices.length <= 1) return;
    const t = setInterval(
      () => setHighIdx(i => (i + 1) % highNotices.length),
      settings.multiHighDuration * 1000
    );
    return () => clearInterval(t);
  }, [highNotices.length, settings.multiHighDuration]);

  // Cycle notice cards page
  const totalNoticePages = Math.max(1, Math.ceil(otherNotices.length / perPage));
  useEffect(() => {
    if (otherNotices.length <= perPage) return;
    const t = setInterval(
      () => setNoticePageIdx(i => (i + 1) % totalNoticePages),
      settings.multiNoticePageDuration * 1000
    );
    return () => clearInterval(t);
  }, [otherNotices.length, perPage, totalNoticePages, settings.multiNoticePageDuration]);

  // Cycle achievement spotlight
  useEffect(() => {
    if (achievements.length <= 1) return;
    const t = setInterval(
      () => setSpotlightIdx(i => (i + 1) % achievements.length),
      settings.multiAchievementDuration * 1000
    );
    return () => clearInterval(t);
  }, [achievements.length, settings.multiAchievementDuration]);

  // Visible notice cards for the current page
  const visibleNotices = useMemo(() => {
    const start = noticePageIdx * perPage;
    return otherNotices.slice(start, start + perPage);
  }, [otherNotices, noticePageIdx, perPage]);

  const heroNotice = highNotices.length > 0 ? highNotices[highIdx % highNotices.length] : null;
  const spotlight = achievements.length > 0 ? achievements[spotlightIdx % achievements.length] : null;

  const gridCols = perPage === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* ── Left column ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">

        {/* HIGH PRIORITY panel */}
        <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 58%' }}>
          {/* Section header */}
          <div className="flex items-center gap-2.5 px-6 pt-4 pb-2.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-slate-500">
              High Priority
              {highNotices.length > 1 && (
                <span className="ml-2 text-rose-500/70">({(highIdx % highNotices.length) + 1}/{highNotices.length})</span>
              )}
            </span>
          </div>

          {/* Hero notice */}
          <div className="flex-1 min-h-0 px-6 pb-3 relative">
            {heroNotice ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroNotice.id ?? highIdx}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  {/* Scale down the full TVNoticePreview to fit the panel */}
                  <div className="h-full rounded-2xl border border-white/8 overflow-hidden bg-white/[0.02]"
                    style={{ containerType: 'size' }}>
                    <div className="h-full" style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '181.8%', height: '181.8%' }}>
                      <TVNoticePreview notice={heroNotice} />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="h-full rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center">
                <p className="text-[0.7rem] text-slate-600 font-bold uppercase tracking-widest">No high priority notices</p>
              </div>
            )}
          </div>
        </div>

        {/* NOTICES grid panel */}
        <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 42%' }}>
          {/* Section header */}
          <div className="flex items-center gap-2.5 px-6 pt-1 pb-2.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
            <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-slate-500">
              Notices
            </span>
            <span className="text-[0.55rem] font-black text-primary/50 uppercase tracking-widest ml-1">
              ({noticePageIdx + 1}/{totalNoticePages})
            </span>
            {/* Page navigation dots */}
            {totalNoticePages > 1 && (
              <div className="flex items-center gap-1 ml-3">
                {Array.from({ length: totalNoticePages }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === noticePageIdx ? 14 : 5,
                      height: 5,
                      backgroundColor:
                        i === noticePageIdx
                          ? 'hsl(var(--primary))'
                          : 'rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cards */}
          <div className="flex-1 min-h-0 px-6 pb-4">
            {otherNotices.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[0.65rem] text-slate-600 font-bold uppercase tracking-widest">All caught up — no pending notices</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={noticePageIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className={cn('grid h-full gap-3', gridCols)}
                >
                  {visibleNotices.map(n => (
                    <CompactCard key={n.id} notice={n} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── Right sidebar: Student Spotlight ──────────────────────────────────── */}
      <aside className="w-80 shrink-0 border-l border-white/5 flex flex-col overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 shrink-0">
          <Trophy className="h-3.5 w-3.5 text-yellow-400" />
          <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500">
            Student Spotlight
            {achievements.length > 0 && (
              <span className="ml-1.5 text-yellow-400/60">
                ({(spotlightIdx % achievements.length) + 1}/{achievements.length})
              </span>
            )}
          </span>
          <span className="ml-auto text-[0.5rem] font-black uppercase tracking-widest text-yellow-500/50">Achievements</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 shrink-0 mx-5" />

        {/* Spotlight */}
        <div className="flex-1 overflow-hidden p-5 flex flex-col min-h-0">
          <Spotlight
            achievement={spotlight}
            quoteText={quoteText}
            quoteAuthor={quoteAuthor}
            totalCount={achievements.length}
            currentIdx={spotlightIdx}
          />
        </div>

        {/* Decorative glow orbs */}
        <div className="absolute pointer-events-none select-none inset-0 overflow-hidden rounded-r-sm" aria-hidden>
          <div className="absolute -bottom-20 -right-10 w-48 h-48 rounded-full bg-yellow-400/5 blur-3xl" />
          <div className="absolute -top-16 -right-6 w-36 h-36 rounded-full bg-primary/5 blur-2xl" />
        </div>
      </aside>
    </div>
  );
};

export default TVMultiView;
