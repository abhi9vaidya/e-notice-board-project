import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveNotices, useActiveAchievements } from '@/hooks/useFirebaseNotices';
import {
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import rbuLogo from '@/assets/rbu-logo.png';
import { TVNoticePreview } from '@/components/TVNoticePreview';

const TVDisplay: React.FC = () => {
  const { notices: activeNotices, loading: noticesLoading } = useActiveNotices();
  const { achievements, loading: achievementsLoading } = useActiveAchievements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scaleFactor, setScaleFactor] = useState(1);

  // Responsive scaling logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const referenceWidth = 1920;
      const referenceHeight = 1080;

      const scaleW = width / referenceWidth;
      const scaleH = height / referenceHeight;
      const scale = Math.min(scaleW, scaleH, 1); // Never scale up, only down
      setScaleFactor(scale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      {/* Hero Content with scaling wrapper */}
      <main className="flex-1 p-16 relative overflow-hidden flex items-center justify-center">
        <div
          className="w-[1792px] h-[800px] shrink-0 origin-center"
          style={{ transform: `scale(${scaleFactor})` }}
        >
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
                <TVNoticePreview notice={displayItems[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
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

