import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notice, Template } from '@/integrations/firebase/types';
import { useActiveNotices, useActiveAchievements } from '@/hooks/useFirebaseNotices';
import {
  Wifi,
  WifiOff,
  Clock,
  User,
  Sparkles,
  RefreshCw,
  Zap,
  Trophy,
  GraduationCap,
  FileText,
  Briefcase,
  Megaphone,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import rbuLogo from '@/assets/rbu-logo.png';

const categoryConfig: Record<string, { icon: React.ElementType; label: string; accent: string }> = {
  academic: { icon: GraduationCap, label: 'Academic', accent: '#3b82f6' },
  examinations: { icon: FileText, label: 'Examinations', accent: '#ef4444' },
  placements: { icon: Briefcase, label: 'Placements', accent: '#f59e0b' },
  events: { icon: Sparkles, label: 'Events', accent: '#8b5cf6' },
  announcements: { icon: Megaphone, label: 'Announcements', accent: '#10b981' },
  achievements: { icon: Trophy, label: 'Achievements', accent: '#facc15' },
  other: { icon: MoreHorizontal, label: 'Other', accent: '#64748b' },
};

const TVDisplay: React.FC = () => {
  const { notices: activeNotices, loading: noticesLoading } = useActiveNotices();
  const { achievements, loading: achievementsLoading } = useActiveAchievements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const displayItems = useMemo(() => {
    if (activeNotices && activeNotices.length > 0) {
      return activeNotices.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return achievements || [];
  }, [activeNotices, achievements]);

  const isAchievementMode = !activeNotices || activeNotices.length === 0;

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % displayItems.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [displayItems.length]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderTemplate = (notice: Notice) => {
    const config = categoryConfig[notice.category] || categoryConfig.other;
    const CategoryIcon = config.icon;
    const template = notice.template as Template || 'standard';

    const header = (
      <div className="flex items-center gap-6 mb-12">
        <div
          className="flex items-center gap-3 px-6 py-2 rounded-full text-white font-bold text-lg"
          style={{ backgroundColor: config.accent }}
        >
          <CategoryIcon className="h-6 w-6" />
          {notice.customCategory || config.label}
        </div>
        {notice.priority === 'high' && (
          <div className="flex items-center gap-2 px-6 py-2 rounded-full font-black text-rose-500 border-2 border-rose-500">
            <Zap className="h-6 w-6 fill-rose-500" />
            URGENT
          </div>
        )}
      </div>
    );

    const footer = (
      <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <User className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">Issued By</p>
            <p className="text-xl font-bold text-white">{notice.facultyName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">Valid Till</p>
          <p className="text-xl font-bold text-white">{format(new Date(notice.endTime), 'dd MMM yyyy')}</p>
        </div>
      </div>
    );

    switch (template) {
      case 'split':
        return (
          <div className="h-full grid grid-cols-5 gap-16">
            <div className="col-span-3 flex flex-col h-full py-6">
              {header}
              <h1 className="text-[5.5rem] font-bold text-white leading-[1.05] tracking-tight mb-8">
                {notice.title}
              </h1>
              <div className="flex-1 overflow-hidden">
                <p className="text-3xl text-slate-400 leading-relaxed max-w-3xl">
                  {notice.description}
                </p>
              </div>
              {footer}
            </div>
            <div className="col-span-2 relative py-6">
              {notice.imageUrl ? (
                <div className="h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl">
                  <img src={notice.imageUrl} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-full rounded-[2.5rem] bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                  <FileText className="h-32 w-32 text-white/5" />
                </div>
              )}
            </div>
          </div>
        );

      case 'full-image':
        return (
          <div className="relative h-full w-full rounded-[3rem] overflow-hidden border border-white/5">
            <img src={notice.imageUrl || ''} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-20 flex flex-col items-start">
              <div className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-bold mb-8">
                {notice.customCategory || config.label}
              </div>
              <h1 className="text-8xl font-bold text-white leading-tight mb-6 drop-shadow-xl">
                {notice.title}
              </h1>
              <p className="text-3xl text-slate-200 leading-relaxed max-w-4xl drop-shadow-lg line-clamp-3">
                {notice.description}
              </p>
              <div className="mt-12 flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-white/60" />
                  <span className="text-2xl font-bold text-white">{notice.facultyName}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-2xl font-bold text-white/80">{format(new Date(notice.endTime), 'dd MMMM')}</span>
              </div>
            </div>
          </div>
        );

      case 'text-only':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-6xl mx-auto py-10">
            {header}
            <h1 className="text-[6.5rem] font-bold text-white leading-[1] tracking-tight mb-12">
              {notice.title}
            </h1>
            <div className="w-32 h-1 mb-12" style={{ backgroundColor: config.accent }} />
            <p className="text-[2.25rem] text-slate-400 leading-[1.4] max-w-5xl">
              {notice.description}
            </p>
            <div className="mt-20 flex items-center gap-16 text-slate-500 font-bold uppercase tracking-[0.2em] text-lg">
              <span>{notice.facultyName}</span>
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <span>{format(new Date(notice.endTime), 'dd MMM yyyy')}</span>
            </div>
          </div>
        );

      case 'featured':
        return (
          <div className="h-full bg-white/5 rounded-[3rem] border border-white/10 p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10">
              <Trophy className="h-40 w-40 text-white/5 -rotate-12" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="text-primary font-black uppercase tracking-[0.4em] mb-4">Featured Update</div>
              <h1 className="text-8xl font-bold text-white mb-10 leading-tight">
                {notice.title}
              </h1>
              <div className="flex-1 overflow-hidden pr-10">
                <p className="text-4xl text-slate-300 leading-relaxed">
                  {notice.description}
                </p>
              </div>
              <div className="mt-12 flex items-center gap-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <User className="h-8 w-8 text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Authorized By</p>
                    <p className="text-2xl font-bold text-white">{notice.facultyName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex flex-col py-6">
            {header}
            <div className="flex-1 flex items-center gap-20">
              <div className="flex-1">
                <h1 className="text-[6rem] font-bold text-white leading-[1] tracking-tight mb-10">
                  {notice.title}
                </h1>
                <p className="text-3xl text-slate-400 leading-relaxed max-w-4xl">
                  {notice.description}
                </p>
              </div>
              {notice.imageUrl && (
                <div className="w-[30vw] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shrink-0">
                  <img src={notice.imageUrl} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {footer}
          </div>
        );
    }
  };

  if (noticesLoading || achievementsLoading) {
    return (
      <div className="h-screen bg-[#05060a] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-primary animate-spin mb-6 mx-auto" />
          <p className="text-slate-500 font-bold tracking-[0.3em] uppercase">Updating Board</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#05060a] text-white flex flex-col overflow-hidden font-sans">
      {/* Clean Header */}
      <header className="h-32 px-16 flex items-center justify-between border-b border-white/5 relative z-20">
        <div className="flex items-center gap-8">
          <div className="h-16 w-16 bg-white p-2 rounded-2xl">
            <img src={rbuLogo} className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Ramdeobaba University</h1>
            <p className="text-sm font-bold tracking-[0.5em] text-slate-500 uppercase mt-1"> नागपुर • Digital Campus</p>
          </div>
        </div>

        <div className="flex items-center gap-12 text-right">
          <div className="flex flex-col">
            <span className="text-5xl font-bold tabular-nums tracking-tighter">
              {format(currentTime, 'HH:mm:ss')}
            </span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
              {format(currentTime, 'EEEE, MMM do')}
            </span>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
              Connected
            </div>
            <p className="text-xs text-slate-600 font-bold mt-1">Auto-Refreshing</p>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 p-16 relative overflow-hidden">
        {displayItems.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-50">
            <div className="text-center font-bold uppercase tracking-[0.5em] text-slate-500">
              <Sparkles className="h-20 w-20 mx-auto mb-8 opacity-20" />
              No active announcements
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={displayItems[currentIndex]?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {renderTemplate(displayItems[currentIndex])}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Minimal Ticker */}
      <footer className="h-14 bg-white text-black flex items-center overflow-hidden">
        <div className="px-10 h-full bg-primary text-black flex items-center font-black uppercase tracking-tighter text-sm z-30">
          News Ticker
        </div>
        <div className="flex-1 flex overflow-hidden">
          <motion.div
            className="flex items-center gap-24 whitespace-nowrap px-10 font-bold text-lg uppercase tracking-wider italic"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            {[...displayItems, ...displayItems].map((item, i) => (
              <span key={i} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-black/20" />
                {item.title}
              </span>
            ))}
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default TVDisplay;

