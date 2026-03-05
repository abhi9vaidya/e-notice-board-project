/**
 * TVMultiView â€” the "overview" layout for the TV notice board.
 *
 * Adaptive layout â€” automatically chosen based on notice count:
 *
 *  achievements-only  (0 notices)
 *  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 *  â”‚  2-3 large Achievement cards side-by-side, cycling through all          â”‚
 *  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *
 *  single-notice  (1 notice, any priority)
 *  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”‚
 *  â”‚  Large notice card (title + image /  â”‚  Student Spotlight                â”‚
 *  â”‚  description, fills the space)       â”‚  2 achievements shown at once     â”‚
 *  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *
 *  few-notices  (2-3 notices, NO high-priority)
 *  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 *  â”‚  Notices grid â€” full height          â”‚  Student Spotlight                â”‚
 *  â”‚  (2-col for 2, 3-col for 3)         â”‚                                   â”‚
 *  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *
 *  standard  (has high-priority OR 4+ notices)
 *  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 *  â”‚  HIGH PRIORITY hero                  â”‚  Student Spotlight                â”‚
 *  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                                   â”‚
 *  â”‚  NOTICES grid (paged)               â”‚                                   â”‚
 *  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, User, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { TVNoticePreview } from '@/components/TVNoticePreview';
import { AutoScrollText } from '@/components/AutoScrollText';
import { categoryConfig } from '@/config/categoryConfig';
import { cn } from '@/lib/utils';
import type { TVDisplaySettings } from '@/hooks/useTVDisplaySettings';
import type { Notice } from '@/integrations/firebase/types';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// ─── TV Theme Context ─────────────────────────────────────────────────────────
// isLight = true means light mode, false = dark mode (default).
// Sub-components consume this instead of checking html.dark class.
const TVThemeContext = React.createContext(false);
const useTVTheme = () => React.useContext(TVThemeContext);

interface TVMultiViewProps {
  notices: Notice[];
  achievements: Notice[];
  quoteText: string;
  quoteAuthor: string;
  settings: TVDisplaySettings;
  isLight: boolean;
}

type OverviewLayout = 'achievements-only' | 'single-notice' | 'few-notices' | 'standard';

// â”€â”€ Compact notice card (NOTICES grid) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CompactCard: React.FC<{ notice: Notice }> = ({ notice }) => {
  const isLight = useTVTheme();
  const cfg = categoryConfig[notice.category] ?? categoryConfig.other;
  const Icon = cfg.icon;
  const priorityColor =
    notice.priority === 'high' ? 'text-red-400 border-red-500/40'
      : notice.priority === 'medium' ? 'text-amber-400 border-amber-500/40'
        : (isLight ? 'text-slate-500 border-slate-300' : 'text-slate-400 border-white/10');

  return (
    <div className={`h-full flex flex-col rounded-2xl border ${isLight ? "border-slate-200 bg-white shadow-sm" : "border-white/8 bg-white/[0.03]"} overflow-hidden p-4 gap-2.5`}>
      <div className="flex items-center justify-between shrink-0">
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.58rem] font-black uppercase tracking-widest',
          priorityColor,
          notice.priority === 'high' ? (isLight ? 'bg-red-100' : 'bg-red-500/10') : notice.priority === 'medium' ? (isLight ? 'bg-amber-100' : 'bg-amber-500/10') : (isLight ? 'bg-slate-100' : 'bg-white/5')
        )}>
          {notice.priority === 'high' && <Zap className="h-2.5 w-2.5 fill-current" />}
          <Icon className="h-2.5 w-2.5" />
          {notice.customCategory ?? cfg.label}
        </div>
        <span className="text-[0.6rem] text-slate-500 font-medium tabular-nums shrink-0">
          {format(new Date(notice.createdAt), 'dd MMM')}
        </span>
      </div>
      <h3 className={`text-[0.9rem] font-black ${isLight ? "text-slate-900" : "text-white"} leading-snug line-clamp-2 shrink-0`}>{notice.title}</h3>
      {notice.imageUrl ? (
        <div className={`flex-1 min-h-0 rounded-xl overflow-hidden border ${isLight ? "border-slate-200" : "border-white/8"}`}>
          <img src={notice.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : notice.description ? (
        <p className={`flex-1 text-[0.72rem] ${isLight ? "text-slate-500" : "text-slate-400"} leading-relaxed line-clamp-4 min-h-0`}>
          {notice.description.replace(/[#*`_~>[\]]/g, '').trim()}
        </p>
      ) : null}
      <div className={`flex items-center gap-1.5 shrink-0 mt-auto pt-1 border-t ${isLight ? "border-slate-100" : "border-white/5"}`}>
        <User className="h-3 w-3 text-slate-600" />
        <span className="text-[0.6rem] text-slate-600 font-medium truncate">{notice.facultyName}</span>
      </div>
    </div>
  );
};

// â”€â”€ Large notice card (single-notice layout) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Shows one notice prominently with full description scrolling.

const LargeNoticeCard: React.FC<{ notice: Notice }> = ({ notice }) => {
  const isLight = useTVTheme();
  const cfg = categoryConfig[notice.category] ?? categoryConfig.other;
  const Icon = cfg.icon;
  const isHigh = notice.priority === 'high';

  return (
    <div className={`h-full flex flex-col rounded-2xl border ${isLight ? "border-slate-200 bg-white shadow-sm" : "border-white/8 bg-white/[0.03]"} overflow-hidden p-6 gap-4`}>
      {/* Badge row */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white font-bold text-sm"
          style={{ backgroundColor: cfg.accent }}
        >
          <Icon className="h-4 w-4" />
          {notice.customCategory ?? cfg.label}
        </div>
        {isHigh && (
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-black text-rose-500 border-2 border-rose-500 text-sm">
            <Zap className="h-4 w-4 fill-rose-500" />
            URGENT
          </div>
        )}
        <span className="ml-auto text-xs text-slate-500 font-medium tabular-nums shrink-0">
          {format(new Date(notice.createdAt), 'dd MMM yyyy')}
        </span>
      </div>

      {/* Title */}
      <h2 className={`text-3xl font-black ${isLight ? "text-slate-900" : "text-white"} leading-snug shrink-0 line-clamp-3`}>{notice.title}</h2>

      {/* Image + description split */}
      {notice.imageUrl ? (
        <div className="flex-1 min-h-0 flex gap-4">
          <div className={`w-[45%] shrink-0 rounded-xl overflow-hidden border ${isLight ? "border-slate-200" : "border-white/8"}`}>
            <img src={notice.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
          {notice.description && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <AutoScrollText
                content={notice.description}
                className={`text-[0.9rem] ${isLight ? "text-slate-500" : "text-slate-400"} leading-relaxed`}
                speed={20}
              />
            </div>
          )}
        </div>
      ) : notice.description ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <AutoScrollText
            content={notice.description}
            className={`text-[1rem] ${isLight ? "text-slate-500" : "text-slate-400"} leading-relaxed`}
            speed={20}
          />
        </div>
      ) : null}

      {/* Footer */}
      <div className={`flex items-center gap-2 shrink-0 mt-auto pt-3 border-t ${isLight ? "border-slate-100" : "border-white/5"}`}>
        <User className="h-4 w-4 text-slate-600" />
        <span className="text-xs text-slate-500 font-medium">{notice.facultyName}</span>
        {notice.endTime && (
          <>
            <div className={`w-1 h-1 rounded-full ${isLight ? "bg-slate-300" : "bg-white/10"} mx-1`} />
            <span className="text-xs text-slate-600">Valid till {format(new Date(notice.endTime), 'dd MMM yyyy')}</span>
          </>
        )}
      </div>
    </div>
  );
};

// â”€â”€ Achievement card (achievements-only layout) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// A larger, self-contained achievement display used in the full-width grid.

const AchievementCard: React.FC<{ achievement: Notice; idx: number; total: number }> = ({ achievement, idx, total }) => {
  const isLight = useTVTheme();
  return (
    <div className={`h-full flex flex-col rounded-2xl border ${isLight ? "border-yellow-300 bg-amber-50/80" : "border-yellow-400/15 bg-white/[0.02]"} overflow-hidden p-5 gap-3`}
      style={{ background: isLight ? 'linear-gradient(135deg, rgba(255,251,235,0.9) 0%, rgba(254,252,232,0.75) 100%)' : 'linear-gradient(135deg, rgba(26,18,0,0.6) 0%, rgba(15,10,0,0.4) 100%)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <Trophy className="h-4 w-4 text-yellow-400" />
        <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-yellow-400/60">Achievement</span>
        {total > 1 && (
          <span className="ml-auto text-[0.55rem] text-yellow-400/40 font-bold">{idx + 1}/{total}</span>
        )}
      </div>

      {/* Image */}
      {achievement.imageUrl && (
        <div className={`w-full rounded-xl overflow-hidden shrink-0 border ${isLight ? "border-yellow-300" : "border-yellow-400/10"}`}
          style={{ aspectRatio: '16/9' }}>
          <img src={achievement.imageUrl} alt={achievement.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title */}
      <h3 className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"} leading-snug shrink-0 line-clamp-2`}>{achievement.title}</h3>

      {/* Description */}
      {achievement.description && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <AutoScrollText
            content={achievement.description}
            className={`text-[0.78rem] ${isLight ? "text-yellow-800" : "text-yellow-100/60"}`}
            speed={18}
          />
        </div>
      )}

      {/* Faculty */}
      {achievement.facultyName && (
        <div className={`shrink-0 flex items-center gap-1.5 mt-auto pt-2 border-t ${isLight ? "border-yellow-200" : "border-yellow-400/8"}`}>
          <User className="h-3 w-3 text-yellow-400/30" />
          <span className="text-[0.6rem] text-yellow-400/40 font-medium">{achievement.facultyName}</span>
        </div>
      )}
    </div>
  );
};

// â”€â”€ Spotlight sidebar component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SpotlightProps {
  achievement: Notice | null;
  quoteText: string;
  quoteAuthor: string;
  totalCount: number;
  currentIdx: number;
}

const Spotlight: React.FC<SpotlightProps> = ({ achievement, quoteText, quoteAuthor, totalCount, currentIdx }) => {
  const isLight = useTVTheme();
  return (
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
          <p className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"} leading-snug shrink-0`}>{achievement.title}</p>
          {achievement.imageUrl && (
            <div className={`w-full rounded-xl overflow-hidden shrink-0 border ${isLight ? "border-yellow-300" : "border-yellow-400/10"}`} style={{ aspectRatio: '4/3' }}>
              <img src={achievement.imageUrl} alt={achievement.title} className="w-full h-full object-cover" />
            </div>
          )}
          {achievement.description && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <AutoScrollText content={achievement.description} className={`text-[0.82rem] ${isLight ? "text-yellow-800" : "text-yellow-100/70"}`} speed={22} />
            </div>
          )}
          {totalCount > 1 && (
            <div className="flex justify-center gap-1 shrink-0">
              {Array.from({ length: totalCount }).map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-500" style={{
                  width: i === currentIdx % totalCount ? 14 : 5, height: 5,
                  backgroundColor: i === currentIdx % totalCount ? '#facc15' : (isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'),
                }} />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div key="no-achievement" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex-1 flex flex-col justify-center items-center min-h-0 text-center">
          <Trophy className="h-12 w-12 text-yellow-400/20 mb-4" />
          <p className={`text-[0.78rem] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-relaxed italic`}>&ldquo;{quoteText}&rdquo;</p>
          {quoteAuthor && <p className={`text-[0.62rem] ${isLight ? 'text-slate-500' : 'text-slate-500'} font-bold mt-2`}>&mdash; {quoteAuthor}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// -- Multi-achievement sidebar (single-notice layout) --
// Shows 2 achievement cards simultaneously, cycling as a slideshow.
const MultiAchievementSidebar: React.FC<{
  achievements: Notice[];
  spotlightIdx: number;
  quoteText: string;
  quoteAuthor: string;
}> = ({ achievements, spotlightIdx, quoteText, quoteAuthor }) => {
  const isLight = useTVTheme();
  const perPage = 2;
  const total = achievements.length;
  const pageCount = total > 0 ? Math.ceil(total / perPage) : 0;
  const currentPage = total > 0 ? Math.floor((spotlightIdx % total) / perPage) : 0;
  const pageStart = currentPage * perPage;
  const visible = total > 0 ? achievements.slice(pageStart, pageStart + perPage) : [];

  return (
    <aside className={`flex-1 border-l ${isLight ? "border-slate-200" : "border-white/5"} flex flex-col overflow-hidden min-h-0`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 shrink-0">
        <Trophy className="h-3.5 w-3.5 text-yellow-400" />
        <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500">
          Student Spotlight
        </span>
        {total > 0 && (
          <span className="ml-auto text-[0.5rem] font-black uppercase tracking-widest text-yellow-500/50">
            {pageStart + 1}–{Math.min(pageStart + perPage, total)} / {total}
          </span>
        )}
      </div>
      <div className={`h-px ${isLight ? "bg-slate-200" : "bg-white/5"} shrink-0 mx-5`} />

      {/* Cards */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3 min-h-0">
        {visible.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={pageStart}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              {visible.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex-1 min-h-0 rounded-2xl border ${isLight ? "border-yellow-300 bg-amber-50/60" : "border-yellow-400/10 bg-yellow-400/[0.03]"} flex flex-col overflow-hidden p-4 gap-3`}
                  style={{ background: isLight ? 'linear-gradient(135deg, rgba(255,251,235,0.9) 0%, rgba(254,252,232,0.75) 100%)' : 'linear-gradient(135deg, rgba(26,18,0,0.5) 0%, rgba(15,10,0,0.35) 100%)' }}
                >
                  {/* Top: image + meta */}
                  <div className="flex gap-3 items-start shrink-0">
                    {ach.imageUrl && (
                      <div className={`w-24 rounded-xl overflow-hidden shrink-0 border ${isLight ? "border-yellow-300" : "border-yellow-400/10"}`}
                        style={{ aspectRatio: '4/3' }}>
                        <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Trophy className="h-3 w-3 text-yellow-400 shrink-0" />
                        <span className="text-[0.5rem] font-black uppercase tracking-[0.25em] text-yellow-400/60">Achievement</span>
                      </div>
                      <p className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"} leading-snug line-clamp-2`}>{ach.title}</p>
                      {ach.facultyName && (
                        <p className="text-[0.62rem] text-yellow-400/40 font-medium mt-1">{ach.facultyName}</p>
                      )}
                    </div>
                  </div>
                  {/* Scrolling description */}
                  {ach.description && (
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <AutoScrollText
                        content={ach.description}
                        className={`text-[0.78rem] ${isLight ? "text-yellow-800" : "text-yellow-100/55"} leading-relaxed`}
                        speed={22}
                      />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center min-h-0 text-center">
            <Trophy className="h-12 w-12 text-yellow-400/20 mb-4" />
            <p className={`text-[0.78rem] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-relaxed italic`}>&ldquo;{quoteText}&rdquo;</p>
            {quoteAuthor && <p className={`text-[0.62rem] ${isLight ? 'text-slate-500' : 'text-slate-500'} font-bold mt-2`}>&mdash; {quoteAuthor}</p>}
          </div>
        )}
      </div>

      {/* Page dots */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-1 pb-4 shrink-0">
          {Array.from({ length: pageCount }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-500" style={{
              width: i === currentPage ? 14 : 5, height: 5,
              backgroundColor: i === currentPage ? '#facc15' : (isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'),
            }} />
          ))}
        </div>
      )}
    </aside>
  );
};

// â”€â”€ Shared sidebar shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SpotlightSidebar: React.FC<{
  achievements: Notice[];
  spotlightIdx: number;
  quoteText: string;
  quoteAuthor: string;
  spotlight: Notice | null;
  wide?: boolean;
}> = ({ achievements, spotlightIdx, quoteText, quoteAuthor, spotlight, wide }) => {
  const isLight = useTVTheme();
  return (
    <aside className={`${wide ? "w-[30rem]" : "w-80"} shrink-0 border-l ${isLight ? "border-slate-200" : "border-white/5"} flex flex-col overflow-hidden`}>
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
      <div className={`h-px ${isLight ? "bg-slate-200" : "bg-white/5"} shrink-0 mx-5`} />
      <div className="flex-1 overflow-hidden p-5 flex flex-col min-h-0">
        <Spotlight
          achievement={spotlight}
          quoteText={quoteText}
          quoteAuthor={quoteAuthor}
          totalCount={achievements.length}
          currentIdx={spotlightIdx}
        />
      </div>
    </aside>
  );
};

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const TVMultiView: React.FC<TVMultiViewProps> = ({
  notices,
  achievements,
  quoteText,
  quoteAuthor,
  settings,
  isLight,
}) => {
  const perPage = settings.multiNoticesPerRow;

  const highNotices = useMemo(() => notices.filter(n => n.priority === 'high'), [notices]);
  const otherNotices = useMemo(() => notices.filter(n => n.priority !== 'high'), [notices]);

  // â”€â”€ Determine which layout to render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const layout: OverviewLayout = useMemo<OverviewLayout>(() => {
    if (notices.length === 0) return 'achievements-only';
    if (notices.length === 1) return 'single-notice';
    if (notices.length <= 3 && highNotices.length === 0) return 'few-notices';
    return 'standard';
  }, [notices.length, highNotices.length]);

  // â”€â”€ Timers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [highIdx, setHighIdx] = useState(0);
  const [noticePageIdx, setNoticePageIdx] = useState(0);
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  // achievements-only: cycle groups of visible achievement cards
  const achievePerPage = 3;
  const [achievePageIdx, setAchievePageIdx] = useState(0);

  useEffect(() => {
    if (highNotices.length <= 1) return;
    const t = setInterval(() => setHighIdx(i => (i + 1) % highNotices.length), settings.multiHighDuration * 1000);
    return () => clearInterval(t);
  }, [highNotices.length, settings.multiHighDuration]);

  const totalNoticePages = Math.max(1, Math.ceil(otherNotices.length / perPage));
  useEffect(() => {
    if (otherNotices.length <= perPage) return;
    const t = setInterval(() => setNoticePageIdx(i => (i + 1) % totalNoticePages), settings.multiNoticePageDuration * 1000);
    return () => clearInterval(t);
  }, [otherNotices.length, perPage, totalNoticePages, settings.multiNoticePageDuration]);

  useEffect(() => {
    if (achievements.length <= 1) return;
    const t = setInterval(() => setSpotlightIdx(i => (i + 1) % achievements.length), settings.multiAchievementDuration * 1000);
    return () => clearInterval(t);
  }, [achievements.length, settings.multiAchievementDuration]);

  const totalAchievePages = Math.max(1, Math.ceil(achievements.length / achievePerPage));
  useEffect(() => {
    if (achievements.length <= achievePerPage) return;
    const t = setInterval(() => setAchievePageIdx(i => (i + 1) % totalAchievePages), settings.multiAchievementDuration * 1000);
    return () => clearInterval(t);
  }, [achievements.length, totalAchievePages, settings.multiAchievementDuration]);

  const visibleNotices = useMemo(() => {
    const start = noticePageIdx * perPage;
    return otherNotices.slice(start, start + perPage);
  }, [otherNotices, noticePageIdx, perPage]);

  const heroNotice = highNotices.length > 0 ? highNotices[highIdx % highNotices.length] : null;
  const spotlight = achievements.length > 0 ? achievements[spotlightIdx % achievements.length] : null;
  const visibleAchievements = useMemo(() => {
    const start = achievePageIdx * achievePerPage;
    return achievements.slice(start, start + achievePerPage);
  }, [achievements, achievePageIdx]);

  const gridCols = perPage === 2 ? 'grid-cols-2' : 'grid-cols-3';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // LAYOUT: achievements-only â€” no notices at all
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (layout === 'achievements-only') {
    return (
      <TVThemeContext.Provider value={isLight}>
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 px-6 py-4 gap-4">
          {/* Header row */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-slate-500">
              Student Spotlight â€” Achievements
            </span>
            {achievements.length > achievePerPage && (
              <span className="ml-2 text-yellow-400/50 text-[0.55rem] font-black">
                ({achievePageIdx + 1}/{totalAchievePages})
              </span>
            )}
          </div>

          {/* Achievement cards grid */}
          {achievements.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center opacity-25">
                <Sparkles className="h-14 w-14 mx-auto mb-4" />
                <p className="font-bold uppercase tracking-[0.4em] text-sm">No announcements or achievements yet</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={achievePageIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  'flex-1 min-h-0 grid gap-4',
                  visibleAchievements.length === 1 ? 'grid-cols-1' :
                    visibleAchievements.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                )}
              >
                {visibleAchievements.map((a, i) => (
                  <AchievementCard
                    key={a.id ?? i}
                    achievement={a}
                    idx={achievePageIdx * achievePerPage + i}
                    total={achievements.length}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Page dots for achievement pages */}
          {totalAchievePages > 1 && (
            <div className="flex justify-center gap-1.5 shrink-0">
              {Array.from({ length: totalAchievePages }).map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-500" style={{
                  width: i === achievePageIdx ? 16 : 6, height: 6,
                  backgroundColor: i === achievePageIdx ? '#facc15' : (isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'),
                }} />
              ))}
            </div>
          )}
        </div>
      </TVThemeContext.Provider>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // LAYOUT: single-notice â€” exactly 1 notice
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (layout === 'single-notice') {
    const theNotice = notices[0];
    return (
      <TVThemeContext.Provider value={isLight}>
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Large notice */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-6 pr-4">
            {/* Section label */}
            <div className="flex items-center gap-2.5 mb-3 shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-slate-500">Notice</span>
            </div>
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div key={theNotice.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.4 }} className="h-full">
                  <LargeNoticeCard notice={theNotice} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Multi-achievement panel — show 2-3 achievements simultaneously */}
          <MultiAchievementSidebar
            achievements={achievements}
            spotlightIdx={spotlightIdx}
            quoteText={quoteText}
            quoteAuthor={quoteAuthor}
          />
        </div>
      </TVThemeContext.Provider>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // LAYOUT: few-notices â€” 2-3 notices, no high-priority
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (layout === 'few-notices') {
    const fewCols = notices.length === 2 ? 'grid-cols-2' : 'grid-cols-3';
    return (
      <TVThemeContext.Provider value={isLight}>
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Full-height notices grid */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-6 pr-4 gap-3">
            {/* Section label */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-slate-500">
                Notices
              </span>
              <span className="text-[0.55rem] font-black text-primary/50 uppercase tracking-widest ml-1">
                ({notices.length})
              </span>
            </div>
            {/* Cards â€” full height, no pagination needed */}
            <div className={cn('flex-1 min-h-0 grid gap-4', fewCols)}>
              {notices.map(n => (
                <CompactCard key={n.id} notice={n} />
              ))}
            </div>
          </div>

          {/* Spotlight sidebar */}
          <SpotlightSidebar
            achievements={achievements}
            spotlightIdx={spotlightIdx}
            quoteText={quoteText}
            quoteAuthor={quoteAuthor}
            spotlight={spotlight}
          />
        </div>
      </TVThemeContext.Provider>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // LAYOUT: standard â€” has high-priority OR 4+ notices
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <TVThemeContext.Provider value={isLight}>
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* â”€â”€ Left column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">

          {/* HIGH PRIORITY panel â€” only shown when high-priority notices exist */}
          {heroNotice && (
            <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 58%' }}>
              <div className="flex items-center gap-2.5 px-6 pt-4 pb-2.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-slate-500">
                  High Priority
                  {highNotices.length > 1 && (
                    <span className="ml-2 text-rose-500/70">({(highIdx % highNotices.length) + 1}/{highNotices.length})</span>
                  )}
                </span>
              </div>
              <div className="flex-1 min-h-0 px-6 pb-3 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroNotice.id ?? highIdx}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                  >
                    <div className={`h-full rounded-2xl border ${isLight ? "border-slate-300 bg-white/50" : "border-white/8 bg-white/[0.02]"} overflow-hidden`}
                      style={{ containerType: 'size' }}>
                      <div className="h-full" style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '181.8%', height: '181.8%' }}>
                        <TVNoticePreview notice={heroNotice} isLight={isLight} />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* NOTICES grid panel */}
          {otherNotices.length > 0 && (
            <div className="flex flex-col overflow-hidden" style={{ flex: heroNotice ? '1 1 42%' : '1 1 100%' }}>
              <div className="flex items-center gap-2.5 px-6 pt-1 pb-2.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
                <span className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-slate-500">Notices</span>
                <span className="text-[0.55rem] font-black text-primary/50 uppercase tracking-widest ml-1">
                  ({noticePageIdx + 1}/{totalNoticePages})
                </span>
                {totalNoticePages > 1 && (
                  <div className="flex items-center gap-1 ml-3">
                    {Array.from({ length: totalNoticePages }).map((_, i) => (
                      <div key={i} className="rounded-full transition-all duration-500" style={{
                        width: i === noticePageIdx ? 14 : 5, height: 5,
                        backgroundColor: i === noticePageIdx ? 'hsl(var(--primary))' : (isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'),
                      }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 px-6 pb-4">
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
              </div>
            </div>
          )}

          {/* Edge case: high-priority notices only (no normal notices) */}
          {otherNotices.length === 0 && !heroNotice && (
            <div className="flex-1 flex items-center justify-center">
              <p className={`text-[0.65rem] ${isLight ? "text-slate-400" : "text-slate-600"} font-bold uppercase tracking-widest`}>No pending notices</p>
            </div>
          )}
        </div>

        {/* â”€â”€ Right sidebar: Student Spotlight â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <SpotlightSidebar
          achievements={achievements}
          spotlightIdx={spotlightIdx}
          quoteText={quoteText}
          quoteAuthor={quoteAuthor}
          spotlight={spotlight}
        />
      </div>
    </TVThemeContext.Provider>
  );
};

export default TVMultiView;
